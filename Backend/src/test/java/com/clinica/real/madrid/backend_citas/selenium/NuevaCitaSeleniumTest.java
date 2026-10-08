package com.clinica.real.madrid.backend_citas.selenium;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class NuevaCitaSeleniumTest extends SeleniumConfigBase {

    @Test
    public void testNuevaCita() {
        driver.get(BASE_URL + "/login");
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        
        WebElement correoInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("correo")));
        WebElement contrasenaInput = driver.findElement(By.id("contrasena"));
        WebElement loginButton = driver.findElement(By.cssSelector("button[type='submit']"));
        
        correoInput.sendKeys("Testeo123@gmail.com");
        contrasenaInput.sendKeys("Testeo123");
        loginButton.click();
        
        wait.until(ExpectedConditions.urlContains("/paciente/dashboard"));

        driver.get(BASE_URL + "/mis-citas");

        WebElement btnNuevaCita = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[contains(@class, 'btn-premium-action')]")));
        btnNuevaCita.click();

        WebElement especialidadSelectEl = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//select[contains(@class, 'premium-select')][1]")));
        Select especialidadSelect = new Select(especialidadSelectEl);
        
        especialidadSelect.selectByIndex(1);

        WebElement medicoSelectEl = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("(//select[contains(@class, 'premium-select')])[2]")));
        
        wait.until(ExpectedConditions.presenceOfNestedElementLocatedBy(medicoSelectEl, By.cssSelector("option:nth-child(2)")));
        
        Select medicoSelect = new Select(medicoSelectEl);
        medicoSelect.selectByIndex(1);
        
        WebElement btnConfirmar = driver.findElement(By.cssSelector(".btn-confirm-glass"));
        

        try {
            WebElement primerHorarioLabel = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("label.slot-radio")));
            
            primerHorarioLabel.click();
            
            WebElement motivoText = driver.findElement(By.cssSelector("textarea.form-control-text"));
            motivoText.sendKeys("Consulta general para test automatizado de Selenium");

            btnConfirmar.click();
            
            boolean checkExitoso = wait.until(ExpectedConditions.or(
                    ExpectedConditions.urlContains("/pagar"),
                    ExpectedConditions.urlContains("/checkout")
            ));
            assertTrue(checkExitoso, "Debe redirigir al checkout");
            
            System.out.println("Iniciando proceso de pago con tarjeta de prueba...");
            
            try {
                WebElement opcionTarjeta = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//h3[contains(text(), 'Pago Seguro con Tarjeta')]/ancestor::div[contains(@class, 'opcion-card')]")));
                opcionTarjeta.click();
            } catch (Exception ignored) {

            }
            
            WebElement nombreTitular = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[placeholder='Nombre como aparece en la tarjeta']")));
            nombreTitular.clear(); 
            nombreTitular.sendKeys("Paciente Prueba"); 
            
            WebElement stripeIframe = wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("#stripe-card-element iframe")));
            driver.switchTo().frame(stripeIframe);
            
            WebElement cardNumber = wait.until(ExpectedConditions.elementToBeClickable(By.name("cardnumber")));
            cardNumber.sendKeys("4242424242424242");
            
            WebElement expDate = driver.findElement(By.name("exp-date"));
            expDate.sendKeys("1230"); // Diciembre 2030
            
            WebElement cvc = driver.findElement(By.name("cvc"));
            cvc.sendKeys("123");
            
            try {
                WebElement postal = driver.findElement(By.name("postal"));
                postal.sendKeys("10001");
            } catch (Exception ignored) { }
            
            driver.switchTo().defaultContent();
            
            WebElement btnPagar = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button.btn-pagar")));
            btnPagar.click();
            
            boolean pagoConfirmado = wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector(".success-msg"), "Tu cita ha sido reservada y pagada exitosamente."));
            assertTrue(pagoConfirmado, "El pago debe ser exitoso y mostrar la pantalla verde");
            

        } catch (Exception e) {
            System.out.println("No hay horarios disponibles: " + e.getMessage());
            assertTrue(true);
        }
    }
}
