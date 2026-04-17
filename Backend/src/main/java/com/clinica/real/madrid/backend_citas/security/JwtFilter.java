package com.clinica.real.madrid.backend_citas.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
                                    throws ServletException, IOException {

        String path = request.getServletPath();
        if (path.startsWith("/auth")) { // rutas públicas
            filterChain.doFilter(request, response);
            return;
        }

        final String header = request.getHeader("Authorization");
        System.out.println("Authorization header: " + header); // <-- revisa aquí

        String token = null;
        String username = null;
        
        System.out.println("Authorization header: " + header);


        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
            System.out.println("Token extraído: " + token);

            username = jwtUtil.getUsernameFromToken(token);
            System.out.println("Username from token: " + username);
        }



        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            System.out.println("UserDetails cargado: " + userDetails.getUsername() 
                               + ", roles: " + userDetails.getAuthorities());

            boolean valido = jwtUtil.validateToken(token);
            System.out.println("Token válido? " + valido);

            if (valido) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

        }

        filterChain.doFilter(request, response);
    }
}

