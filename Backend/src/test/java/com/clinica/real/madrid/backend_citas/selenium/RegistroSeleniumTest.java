package com.clinica.real.madrid.backend_citas.selenium;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class RegistroSeleniumTest extends SeleniumConfigBase {

    @Test
    public void testRegistroNuevoUsuario() {
        driver.get(BASE_URL + "/registrar");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        WebElement nombreInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("nombre")));
        WebElement apellidoInput = driver.findElement(By.id("apellido"));
        WebElement correoInput = driver.findElement(By.id("correo"));
        WebElement contrasenaInput = driver.findElement(By.id("contrasena"));
        WebElement confirmarInput = driver.findElement(By.id("confirmar"));
        WebElement dniInput = driver.findElement(By.id("dni"));
        WebElement telefonoInput = driver.findElement(By.id("telefono"));
        WebElement fechaInput = driver.findElement(By.id("fecha"));
        Select paisSelect = new Select(driver.findElement(By.id("pais")));

        String usuarioCorreo = "test_" + UUID.randomUUID().toString().substring(0, 8);

        nombreInput.sendKeys("Usuario");
        apellidoInput.sendKeys("Prueba");
        correoInput.sendKeys(usuarioCorreo);
        contrasenaInput.sendKeys("Testeo123");
        confirmarInput.sendKeys("Testeo123");
        String dniRandom = String.valueOf(10000000 + new java.util.Random().nextInt(90000000));
        String telRandom = "9" + String.valueOf(10000000 + new java.util.Random().nextInt(90000000));
        dniInput.sendKeys(dniRandom);
        telefonoInput.sendKeys(telRandom);
        fechaInput.sendKeys("01-01-1990");
        
        paisSelect.selectByIndex(1);

        WebElement submitButton = driver.findElement(By.cssSelector("button[type='submit']"));
        submitButton.click();

        boolean registroExitoso = wait.until(ExpectedConditions.or(
                ExpectedConditions.urlContains("/login"),
                ExpectedConditions.urlContains("/home")
        ));

        assertTrue(registroExitoso, "El registro no fue exitoso o no redirigió correctamente");
    }
}
