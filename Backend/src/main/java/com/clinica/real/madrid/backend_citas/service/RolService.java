package com.clinica.real.madrid.backend_citas.service;

import com.clinica.real.madrid.backend_citas.exception.BadRequestException;
import com.clinica.real.madrid.backend_citas.model.Rol;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class RolService {

    // Listar todos los roles
    public List<Rol> listar() {
        return Arrays.asList(Rol.values());
    }

    // Obtener rol por nombre
    public Rol obtenerPorNombre(String nombre) {
        try {
            return Rol.valueOf(nombre.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Rol no válido: " + nombre);
        }
    }

    // Validar si un rol existe
    public void validarRolExistente(Rol rol) {
        if (rol == null) {
            throw new BadRequestException("El rol es obligatorio");
        }
    }
}
