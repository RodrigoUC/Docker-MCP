# Conceptos Clave del Model Context Protocol (MCP)

## ¿Qué es el SDK de MCP?

El **SDK (Software Development Kit)** de MCP es una biblioteca que proporciona:

- **Clases base** para crear servidores y clientes MCP
- **Esquemas de validación** para mensajes y herramientas
- **Transportes de comunicación** (stdio, HTTP, WebSocket)
- **Tipos TypeScript** para desarrollo seguro

```javascript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
// El SDK maneja toda la comunicación protocolar
```

## Capabilities (Capacidades)

Las **capabilities** definen qué puede hacer un servidor MCP:

```javascript
capabilities: {
  tools: {},        // Puede ejecutar herramientas
  resources: {},    // Puede servir recursos (archivos, datos)
  prompts: {},      // Puede proporcionar plantillas de prompts
}
```

En nuestro caso:
- Solo declaramos `tools: {}` porque nuestro servidor ejecuta herramientas Docker
- No necesitamos `resources` ni `prompts`

## ¿Dónde se detecta el lenguaje natural?

**IMPORTANTE**: El servidor MCP **NO** detecta lenguaje natural. Esa responsabilidad es del **cliente MCP** (Cline, Claude, etc.).

### Flujo real:

1. **Usuario escribe**: "Crea 3 contenedores de nginx en puerto 8080"

2. **Cliente MCP (Cline)** con modelo de IA:
   - Analiza el texto en lenguaje natural
   - Identifica la intención: crear contenedores
   - Extrae parámetros: imagen=nginx, count=3, port=8080
   - Decide usar la herramienta `create_containers`

3. **Cliente llama al servidor**:
   ```json
   {
     "method": "tools/call",
     "params": {
       "name": "create_containers",
       "arguments": {
         "image": "nginx",
         "count": 3,
         "port": 8080
       }
     }
   }
   ```

4. **Servidor MCP ejecuta** la herramienta y retorna resultado

## Separación de responsabilidades

| Componente | Responsabilidad |
|------------|----------------|
| **Modelo de IA** | Interpretar lenguaje natural → llamadas de herramientas |
| **Cliente MCP** | Comunicarse con el servidor usando el protocolo |
| **Servidor MCP** | Ejecutar herramientas y retornar resultados |

## ¿Cómo el modelo "sabe" qué herramientas usar?

El modelo recibe la **descripción de herramientas** del servidor:

```javascript
{
  name: "create_containers",
  description: "Crea múltiples contenedores Docker a partir de una imagen",
  inputSchema: {
    properties: {
      image: { description: "Nombre de la imagen Docker" },
      count: { description: "Número de contenedores a crear" },
      port: { description: "Puerto base a exponer" }
    }
  }
}
```

Con esta información, el modelo puede:
- **Mapear** "crea contenedores" → `create_containers`
- **Extraer** parámetros del texto natural
- **Validar** que los parámetros coincidan con el schema

## Transporte de comunicación

```javascript
const transport = new StdioServerTransport();
```

**StdioServerTransport** significa:
- Comunicación por **entrada/salida estándar** (stdin/stdout)
- El cliente ejecuta nuestro servidor como proceso hijo
- Los mensajes JSON se envían por pipes del sistema operativo

## Esquemas de validación

```javascript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Maneja solicitudes de "listar herramientas"
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Maneja solicitudes de "ejecutar herramienta"
});
```

Los **schemas** garantizan que:
- Los mensajes tengan el formato correcto
- Los parámetros sean válidos
- La comunicación sea robusta

## Resumen

- **El servidor MCP no entiende lenguaje natural**
- **El modelo de IA (en el cliente) hace la interpretación**
- **El servidor solo ejecuta herramientas estructuradas**
- **MCP es el "puente" entre IA y herramientas**

Esta arquitectura permite que cualquier modelo de IA use las mismas herramientas, sin que el servidor tenga que cambiar.