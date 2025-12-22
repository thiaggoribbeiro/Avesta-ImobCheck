
import { GoogleGenAI } from "@google/genai";
import { Property } from "../types";

export const getAIPropertyInsights = async (property: Property) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

  const historyStr = property.maintenanceHistory
    .map(m => `- ${m.date}: ${m.title} (${m.description})`)
    .join("\n");

  const prompt = `
    Analise o seguinte imóvel e seu histórico de manutenção e forneça uma breve recomendação estratégica para o gestor.
    
    Nome: ${property.nome_completo}
    Endereço: ${property.endereco}, ${property.bairro}, ${property.cidade}
    Situação: ${property.situacao}
    Utilização: ${property.utilizacao}
    Proprietário: ${property.proprietario}
    Histórico:
    ${historyStr || 'Nenhum histórico registrado.'}
    
    Por favor, seja conciso e profissional em português. Forneça insights sobre riscos de manutenção, vacância ou oportunidades de melhoria com base nestes dados.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, não foi possível gerar insights no momento.";
  }
};
