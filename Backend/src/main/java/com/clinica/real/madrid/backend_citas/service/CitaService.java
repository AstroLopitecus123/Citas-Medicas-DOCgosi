package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.exception.ResourceNotFoundException;
import com.clinica.real.madrid.backend_citas.model.Cita;
import com.clinica.real.madrid.backend_citas.model.Disponibilidad;
import com.clinica.real.madrid.backend_citas.model.EstadoCita;
import com.clinica.real.madrid.backend_citas.repository.CitaRepository;
import com.clinica.real.madrid.backend_citas.repository.DisponibilidadRepository;
import com.clinica.real.madrid.backend_citas.repository.HistorialRepository;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;
    
    @Autowired
    private DisponibilidadRepository disponibilidadRepository;
    
    @Autowired
    private HistorialRepository historialRepository;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TwilioService twilioService;

    @Autowired
    private PagoService pagoService;

    public List<Cita> listar() {
        return citaRepository.findAll();
    }

    public Cita obtenerPorId(Long id) {
        return citaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada"));
    }



    public void eliminar(Long id) {
        if (!citaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cita no encontrada");
        }
        citaRepository.deleteById(id);
    }
    
    public List<Cita> obtenerCitasPorPaciente(Long pacienteId) {
        return citaRepository.findByPacienteIdWithMedicoAndEspecialidad(pacienteId);
    }
 // 🔹 Nuevo método: eliminar todas las citas de un usuario
    public void eliminarPorUsuario(Long usuarioId) {
        citaRepository.deleteByPacienteId(usuarioId);
    }
   
    
    //AGREGADO 30/10
    public List<Cita> obtenerCitasPorMedico(Long idMedico) {
        return citaRepository.findByMedicoId(idMedico);
    }
    
    public Cita crearCita(Cita cita) {
        if (cita == null || cita.getMedico() == null || cita.getMedico().getId() == null) {
            throw new RuntimeException("Datos de médico inválidos para crear la cita");
        }
        if (cita.getFecha() == null) {
            throw new RuntimeException("La fecha de la cita es obligatoria");
        }

        // Validar disponibilidad
        List<Disponibilidad> disponibles = disponibilidadRepository
            .findByMedicoIdAndEstado(cita.getMedico().getId(), Disponibilidad.EstadoDisponibilidad.DISPONIBLE);

        // Marcar disponibilidad como NO_DISPONIBLE
        Disponibilidad disp = disponibles.stream()
            .filter(d -> d.getFecha().equals(cita.getFecha().toLocalDate())
                      && !cita.getFecha().toLocalTime().isBefore(d.getHoraInicio())
                      && !cita.getFecha().toLocalTime().isAfter(d.getHoraFin()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("El horario seleccionado ya no está disponible o no existe. Cita: " 
                + cita.getFecha() + ", Disponibles: " + disponibles.size()));

        disp.setEstado(Disponibilidad.EstadoDisponibilidad.NO_DISPONIBLE);
        disponibilidadRepository.save(disp);

        return citaRepository.save(cita);
    }

    public List<Cita> listarPorUsuario(Long usuarioId) {
        return citaRepository.findByPacienteId(usuarioId);
    }

    public List<Cita> listarPorMedico(Long medicoId) {
        return citaRepository.findByMedicoId(medicoId);
    }

    @Transactional
    public void confirmarCita(Long id) {
        int filas = citaRepository.actualizarEstado(id, EstadoCita.CONFIRMADA);
        if (filas == 0) {
            throw new RuntimeException("No se encontró la cita con ID " + id);
        }

        // Obtener cita para notificación
        Cita cita = citaRepository.findById(id).orElseThrow();
        notificarCambioCita(cita, "confirmada");
    }
    
    @Transactional
    public void cancelarCita(Long id) {
        int filas = citaRepository.actualizarEstado(id, EstadoCita.CANCELADA);
        if (filas == 0) {
            throw new RuntimeException("No se encontró la cita con ID " + id);
        }

        // Obtener cita
        Cita cita = citaRepository.findById(id).orElseThrow();
        
        // 🛡️ Liberar el horario automáticamente
        disponibilidadRepository.findByMedicoIdAndFechaAndHoraInicio(
            cita.getMedico().getId(), 
            cita.getFecha().toLocalDate(), 
            cita.getFecha().toLocalTime()
        ).ifPresent(disp -> {
            disp.setEstado(Disponibilidad.EstadoDisponibilidad.DISPONIBLE);
            disponibilidadRepository.save(disp);
        });

        notificarCambioCita(cita, "cancelada");
    }
    
    @Transactional
    public void solicitarReprogramacion(Long id, LocalDateTime nuevaFecha, String motivo) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró la cita con ID " + id));
        cita.setFechaPropuesta(nuevaFecha);
        cita.setEstado(EstadoCita.SOLICITUD_REPROGRAMACION);
        
        // Guardar motivo si se proporciona
        if (motivo != null && !motivo.trim().isEmpty()) {
            cita.setMotivo(motivo);
        }
        
        citaRepository.save(cita);
        
        notificarCambioCita(cita, "solicitud de reprogramación");
    }

    @Transactional
    public void solicitarCancelacion(Long id, String motivo) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró la cita con ID " + id));
        cita.setEstado(EstadoCita.SOLICITUD_CANCELACION);
        cita.setMotivo(motivo);
        citaRepository.save(cita);
        
        notificarCambioCita(cita, "solicitud de cancelación");
    }

    @Transactional
    public void confirmarReprogramacion(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró la cita con ID " + id));
        
        if (cita.getFechaPropuesta() == null) {
            throw new RuntimeException("No hay una fecha propuesta para esta cita");
        }

        LocalDateTime nuevaFecha = cita.getFechaPropuesta();

        // 1️⃣ Liberar el horario antiguo
        disponibilidadRepository.findByMedicoIdAndFechaAndHoraInicio(
            cita.getMedico().getId(), 
            cita.getFecha().toLocalDate(), 
            cita.getFecha().toLocalTime()
        ).ifPresent(disp -> {
            disp.setEstado(Disponibilidad.EstadoDisponibilidad.DISPONIBLE);
            disponibilidadRepository.save(disp);
        });

        // 2️⃣ Bloquear el nuevo horario
        disponibilidadRepository.findByMedicoIdAndFechaAndHoraInicio(
            cita.getMedico().getId(), 
            nuevaFecha.toLocalDate(), 
            nuevaFecha.toLocalTime()
        ).ifPresentOrElse(disp -> {
            if (disp.getEstado() != Disponibilidad.EstadoDisponibilidad.DISPONIBLE) {
                throw new RuntimeException("El nuevo horario ya no está disponible");
            }
            disp.setEstado(Disponibilidad.EstadoDisponibilidad.NO_DISPONIBLE);
            disponibilidadRepository.save(disp);
        }, () -> {
            throw new RuntimeException("El nuevo horario no existe en la agenda del médico");
        });

        cita.setFecha(nuevaFecha);
        cita.setFechaPropuesta(null);
        cita.setEstado(EstadoCita.REPROGRAMACION_ACEPTADA);
        citaRepository.save(cita);

        notificarCambioCita(cita, "reprogramación aprobada");
    }

    @Transactional
    public void rechazarReprogramacion(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró la cita con ID " + id));
        
        cita.setFechaPropuesta(null);
        // Marcamos como rechazada y se mantiene la fecha original
        cita.setEstado(EstadoCita.REPROGRAMACION_RECHAZADA);
        citaRepository.save(cita);

        notificarCambioCita(cita, "solicitud de reprogramación rechazada");
    }

    @Transactional
    public void confirmarCancelacion(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró la cita con ID " + id));
        
        // 1. Ejecutar cancelación (liberar horario y cambiar estado)
        cancelarCita(id); 

        // 2. Procesar Reembolso Automático
        try {
            pagoService.reembolsarPago(id);
        } catch (Exception e) {
            System.err.println("⚠️ Error en reembolso automático para cita " + id + ": " + e.getMessage());
        }

        // 3. Notificación personalizada
        notificarCambioCita(cita, "cancelación aprobada y reembolso gestionado");
    }

    @Transactional
    public void rechazarCancelacion(Long id) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No se encontró la cita con ID " + id));
        
        // Volver al estado previa (Asumimos CONFIRMADA si venía de una solicitud)
        cita.setEstado(EstadoCita.CONFIRMADA);
        citaRepository.save(cita);

        notificarCambioCita(cita, "solicitud de cancelación rechazada. Su cita sigue vigente.");
    }

    @Transactional
    public void reprogramarCita(Long id, LocalDateTime nuevaFecha) {
        // ... (Este método se mantiene para compatibilidad con Admin que reprograma directamente)
    }

    public void eliminarHistorialesPorUsuario(Long usuarioId) {
        // Primero obtenemos todas las citas del usuario
        List<Cita> citas = citaRepository.findByPacienteId(usuarioId);
        for (Cita cita : citas) {
            historialRepository.deleteByCitaId(cita.getId());
        }
    }
    
    
    @Scheduled(fixedRate = 3600000)
    public void enviarRecordatorios() {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime desde = ahora.plusHours(23);
        LocalDateTime hasta = ahora.plusHours(25);

        // Buscar citas CONFIRMADAS dentro del rango
        List<Cita> citas = citaRepository.findByFechaBetweenAndEstado(desde, hasta, EstadoCita.CONFIRMADA);

        for (Cita cita : citas) {
            try {
                enviarRecordatorio(cita);
                System.out.printf("✅ Recordatorio enviado para cita %d (%s)%n",
                        cita.getId(), cita.getFecha());
            } catch (Exception e) {
                System.err.printf("⚠️ Error al enviar recordatorio para cita %d: %s%n",
                        cita.getId(), e.getMessage());
            }
        }
    }
    
    
    /*
    @Scheduled(fixedRate = 30000) // ⏱️ cada 30 segundos (modo prueba)
    public void enviarRecordatorios() {
        LocalDateTime ahora = LocalDateTime.now();

        // Buscar citas CONFIRMADAS en los próximos 5 minutos
        LocalDateTime desde = ahora;
        LocalDateTime hasta = ahora.plusDays(2);

        List<Cita> citas = citaRepository.findByFechaBetweenAndEstado(desde, hasta, EstadoCita.CONFIRMADA);

        for (Cita cita : citas) {
            try {
                enviarRecordatorio(cita);
                System.out.printf("✅ Recordatorio enviado para cita %d (%s)%n",
                        cita.getId(), cita.getFecha());
            } catch (Exception e) {
                System.err.printf("⚠️ Error al enviar recordatorio para cita %d: %s%n",
                        cita.getId(), e.getMessage());
            }
        }
    }
    */
   

    /**
     * ✉️ Envía recordatorio por correo a paciente y médico
     */
    private void enviarRecordatorio(Cita cita) {
        String fecha = cita.getFecha().toLocalDate().toString();
        String hora = cita.getFecha().toLocalTime().toString();

        // 📧 Correo al paciente (desde el correo de la empresa)
        SimpleMailMessage mailPaciente = new SimpleMailMessage();
        mailPaciente.setFrom("clinicarealmadrid32@gmail.com"); // tu correo de empresa
        mailPaciente.setTo(cita.getPaciente().getCorreo());
        mailPaciente.setSubject("📅 Recordatorio de cita médica");
        mailPaciente.setText(String.format(
                "Hola %s,\n\nEste es un recordatorio de su cita con el Dr. %s el %s a las %s.\n\nSaludos,\nClínica Real Madrid",
                cita.getPaciente().getNombre(),
                cita.getMedico().getUsuario().getNombre(),
                fecha,
                hora
        ));

        mailSender.send(mailPaciente);

        System.out.println("✅ Recordatorio enviado a paciente: " 
                + cita.getPaciente().getCorreo() 
                + " para la cita: " + cita.getFecha());
        
     // 📧 Correo al médico (desde el correo de la empresa)
        SimpleMailMessage mailMedico = new SimpleMailMessage();
        mailMedico.setFrom("clinicarealmadrid32@gmail.com");
        mailMedico.setTo(cita.getMedico().getUsuario().getCorreo());
        mailMedico.setSubject("📅 Recordatorio de cita próxima");
        mailMedico.setText(String.format(
                "Hola Dr. %s,\n\nTiene una cita con el paciente %s el %s a las %s.\n\nSaludos,\nClínica Real Madrid",
                cita.getMedico().getUsuario().getNombre(),
                cita.getPaciente().getNombre(),
                fecha,
                hora
        ));
        mailSender.send(mailMedico);

        System.out.println("✅ Recordatorio enviado a médico: " 
                + cita.getMedico().getUsuario().getCorreo() 
                + " para la cita: " + cita.getFecha());

    }
    
    private void notificarCambioCita(Cita cita, String accion) {
        final String f = cita.getFecha().toLocalDate().toString();
        final String h = cita.getFecha().toLocalTime().toString();
        final String nDr = cita.getMedico().getUsuario().getNombre();
        final String nPc = cita.getPaciente().getNombre();
        final com.clinica.real.madrid.backend_citas.model.Usuario pUser = cita.getPaciente();
        final com.clinica.real.madrid.backend_citas.model.Usuario mUser = cita.getMedico().getUsuario();
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            String fecha = f;
            String hora = h;
            String nombreDr = nDr;
            String nombrePcte = nPc;

            // 📝 Determinar textos según la acción para que suenen naturales
            String msgPaciente = "";
            String msgStaff = "";
            String asunto = "📅 Notificación de tu Cita - Clínica Real Madrid";

            if (accion.equals("solicitud de reprogramación")) {
                msgPaciente = String.format("Has solicitado cambiar la fecha de tu cita con el Dr. %s. Nueva propuesta: %s a las %s. Pendiente de aprobación.", nombreDr, fecha, hora);
                msgStaff = String.format("El paciente %s ha solicitado reprogramar su cita con el Dr. %s para el día %s.", nombrePcte, nombreDr, fecha);
            } else if (accion.equals("reprogramación aprobada")) {
                msgPaciente = String.format("¡Tu cambio de cita ha sido aprobado! Te esperamos el %s a las %s con el Dr. %s.", fecha, hora, nombreDr);
                msgStaff = String.format("Se ha aprobado la reprogramación de la cita del paciente %s con el Dr. %s.", nombrePcte, nombreDr);
            } else if (accion.equals("reprogramación rechazada")) {
                msgPaciente = String.format("Lo sentimos, no pudimos aprobar tu cambio de cita con el Dr. %s. Tu horario original o solicitud deben ser revisados.", nombreDr);
                msgStaff = String.format("Se ha rechazado una solicitud de reprogramación para el paciente %s.", nombrePcte);
            } else if (accion.equals("solicitud de cancelación")) {
                msgPaciente = "Tu solicitud de cancelación está siendo procesada por nuestro equipo administrativo.";
                msgStaff = String.format("El paciente %s solicita cancelar su cita con el Dr. %s. Motivo: %s", nombrePcte, nombreDr, cita.getMotivo());
            } else if (accion.equals("cancelación aprobada")) {
                msgPaciente = String.format("Tu cita con el Dr. %s ha sido cancelada exitosamente. El proceso de reembolso se ha iniciado.", nombreDr);
                msgStaff = String.format("Confirmado: Cita cancelada para el paciente %s (Dr. %s).", nombrePcte, nombreDr);
            } else if (accion.equals("cancelación rechazada")) {
                msgPaciente = String.format("Tu solicitud de cancelación para la cita con el Dr. %s no ha sido aprobada. Por favor, contáctanos.", nombreDr);
                msgStaff = String.format("Atención: Se ha rechazado la cancelación solicitada por %s.", nombrePcte);
            } else {
                msgPaciente = String.format("Tu cita con el Dr. %s ha tenido una actualización: %s.", nombreDr, accion);
                msgStaff = String.format("Actualización en cita de %s: %s.", nombrePcte, accion);
            }

            try {
                // 📧 Correo al Paciente
                SimpleMailMessage mailPaciente = new SimpleMailMessage();
                mailPaciente.setFrom("clinicarealmadrid32@gmail.com");
                mailPaciente.setTo(cita.getPaciente().getCorreo());
                mailPaciente.setSubject(asunto);
                mailPaciente.setText(String.format("Hola %s,\n\n%s\n\nSaludos,\nClínica Real Madrid", nombrePcte, msgPaciente));
                mailSender.send(mailPaciente);
            } catch (Exception e) {
                System.err.println("⚠️ No se pudo enviar el correo al paciente: " + e.getMessage());
            }

            try {
                // 📧 Correo al Médico
                SimpleMailMessage mailMedico = new SimpleMailMessage();
                mailMedico.setFrom("clinicarealmadrid32@gmail.com");
                mailMedico.setTo(cita.getMedico().getUsuario().getCorreo());
                mailMedico.setSubject("🔔 Cambio en tu Agenda Médica");
                mailMedico.setText(String.format("Hola Dr. %s,\n\n%s\n\nSaludos,\nClínica Real Madrid", nombreDr, msgStaff));
                mailSender.send(mailMedico);
            } catch (Exception e) {
                System.err.println("⚠️ No se pudo enviar el correo al médico: " + e.getMessage());
            }

            // 🔔 PERSISTENCIA EN DB
            try {
                String tituloNotif = "Aviso de Cita: " + accion.toUpperCase();
                notificacionService.crearNotificacionParaUsuario(tituloNotif, msgPaciente, pUser, cita.getId());
                notificacionService.crearNotificacionParaUsuario("Gestión de Agenda", msgStaff, mUser, cita.getId());
                
                notificacionService.crearNotificacionParaRol("Aviso Staff", msgStaff, "RECEPCION", cita.getId());
                notificacionService.crearNotificacionParaRol("Aviso Staff", msgStaff, "ADMIN", cita.getId());
                        
                System.out.println("✅ Notificaciones guardadas en DB para cita " + cita.getId());
            } catch (Exception e) {
                System.err.println("⚠️ No se pudo guardar la notificación en DB: " + e.getMessage());
            }
        });
    }
}
