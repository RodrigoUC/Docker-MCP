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

## Gestión de dependencias en Node.js

### package.json

El **package.json** es el "manifiesto" del proyecto Node.js:

```json
{
  "name": "docker-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "app/index.js",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  }
}
```

**Propósito**:
- **Identifica el proyecto**: nombre, versión, descripción
- **Define dependencias**: qué bibliotecas necesita el proyecto
- **Configura el comportamiento**: tipo de módulos (ES6), archivo principal
- **Scripts de ejecución**: comandos personalizados (`npm start`)

**Campos importantes**:
- `"type": "module"` → Permite usar `import/export` en lugar de `require`
- `"main"` → Archivo que se ejecuta cuando alguien importa el paquete
- `"dependencies"` → Bibliotecas necesarias para que funcione el proyecto

### package-lock.json

El **package-lock.json** es el "registro exacto" de dependencias:

```json
{
  "name": "docker-mcp-server",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/@modelcontextprotocol/sdk": {
      "version": "0.5.0",
      "resolved": "https://registry.npmjs.org/@modelcontextprotocol/sdk/-/sdk-0.5.0.tgz",
      "integrity": "sha512-..."
    }
  }
}
```

**Propósito**:
- **Versiones exactas**: Registra la versión específica instalada de cada dependencia
- **Integridad**: Checksums para verificar que los paquetes no fueron modificados
- **Reproducibilidad**: Garantiza que todos instalen exactamente las mismas versiones
- **Árbol de dependencias**: Mapea todas las dependencias transitivas

### Diferencias clave

| package.json | package-lock.json |
|--------------|-------------------|
| **Qué quieres** | **Qué tienes** |
| Rangos de versiones (`^0.5.0`) | Versiones exactas (`0.5.0`) |
| Editable manualmente | Generado automáticamente |
| Define el proyecto | Define el estado actual |
| Versionado en git | Versionado en git |

### ¿Por qué ambos archivos?

1. **Flexibilidad vs Estabilidad**:
   - `package.json`: "Acepto cualquier versión 0.5.x"
   - `package-lock.json`: "Pero usa exactamente la 0.5.0"

2. **Desarrollo vs Producción**:
   - En desarrollo: `npm install` puede actualizar versiones
   - En producción: `npm ci` usa exactamente lo del lock file

3. **Colaboración**:
   - Todos los desarrolladores obtienen las mismas versiones
   - Evita el "funciona en mi máquina"

### Comandos importantes

```bash
npm install          # Instala según package.json, actualiza lock
npm ci              # Instala según package-lock.json (exacto)
npm update          # Actualiza dependencias dentro de rangos
```

**En nuestro proyecto MCP**:
- `package.json` declara que necesitamos el SDK de MCP
- `package-lock.json` garantiza que todos usen la misma versión del SDK
- Esto evita problemas de compatibilidad entre diferentes instalaciones