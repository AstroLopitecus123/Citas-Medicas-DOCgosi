package com.clinica.real.madrid.backend_citas.controller;

import com.clinica.real.madrid.backend_citas.model.Disponibilidad;
import com.clinica.real.madrid.backend_citas.service.DisponibilidadService;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/disponibilidades")
public class DisponibilidadController {

	private final DisponibilidadService disponibilidadService;

    public DisponibilidadController(DisponibilidadService disponibilidadService) {
        this.disponibilidadService = disponibilidadService;
    }

    // 🔹 Listar todas las disponibilidades de un médico
    @GetMapping("/medico/{id}")
    public List<Disponibilidad> listarPorMedico(@PathVariable("id") Long medicoId) {
        return disponibilidadService.listarPorMedico(medicoId);
    }


    // 🔹 Listar disponibilidades por rango de fechas (semana actual o futuras)
    @GetMapping("/medico/{id}/rango")
    public List<Disponibilidad> listarPorRango(
            @PathVariable("id") Long medicoId,
            @RequestParam("inicio") String inicio,
            @RequestParam("fin") String fin) {
        return disponibilidadService.listarPorRango(medicoId, LocalDate.parse(inicio), LocalDate.parse(fin));
    }

    // 🔹 Registrar o actualizar disponibilidades
    @PostMapping("/medico/{id}")
    public List<Disponibilidad> guardarDisponibilidades(
            @PathVariable("id") Long medicoId,
            @RequestBody List<Disponibilidad> disponibilidades) {
        return disponibilidadService.guardarDisponibilidades(medicoId, disponibilidades);
    }


    // 🔹 Eliminar disponibilidades en un rango de fechas
    @DeleteMapping("/medico/{id}/rango")
    public void eliminarPorRango(
            @PathVariable("id") Long medicoId,
            @RequestParam("inicio") String inicio,
            @RequestParam("fin") String fin) {
        disponibilidadService.eliminarPorRango(medicoId, LocalDate.parse(inicio), LocalDate.parse(fin));
    }
}