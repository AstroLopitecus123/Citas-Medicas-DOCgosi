import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatRequest {
  pregunta: string;
}

export interface ChatResponse {
  respuesta: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {

  private apiUrl = 'http://localhost:8080/api/chatbot/preguntar';

  constructor(private http: HttpClient) { }

  enviarPregunta(pregunta: string): Observable<ChatResponse> {
    const payload: ChatRequest = { pregunta };
    return this.http.post<ChatResponse>(this.apiUrl, payload);
  }
}
