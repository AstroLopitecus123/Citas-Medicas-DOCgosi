package com.clinica.real.madrid.backend_citas.selenium;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class LoginSeleniumTest extends SeleniumConfigBase {

    @Test
    public void testLoginExitoso() {
        driver.get(BASE_URL + "/login");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        WebElement emailInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("correo")));
        WebElement passwordInput = driver.findElement(By.id("contrasena"));
        WebElement loginButton = driver.findElement(By.cssSelector("button[type='submit']"));

        emailInput.sendKeys("Testeo123@gmail.com");
        passwordInput.sendKeys("Testeo123");
        loginButton.click();

        boolean loginExitoso = wait.until(ExpectedConditions.or(
                ExpectedConditions.urlContains("/home"),
                ExpectedConditions.urlContains("/perfil"),
                ExpectedConditions.urlContains("/paciente/dashboard")
        ));

        assertTrue(loginExitoso, "El login no fue exitoso o no redirigió correctamente");
    }
}
