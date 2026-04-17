package com.clinica.real.madrid.backend_citas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication	
@EnableScheduling
public class BackendCitasApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendCitasApplication.class, args);
	}

}
