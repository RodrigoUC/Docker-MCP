#!/usr/bin/env node
// Importaciones del SDK de Model Context Protocol (MCP)
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
// Importaciones de Node.js para ejecutar comandos y manejar archivos
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Crear instancia del servidor MCP con metadatos básicos
const server = new Server(
  {
    name: "docker-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // Indica que este servidor proporciona herramientas
    },
  }
);

// Manejador para cuando el cliente solicita la lista de herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_containers",
        description: "Crea múltiples contenedores Docker a partir de una imagen",
        inputSchema: {
          type: "object",
          properties: {
            image: {
              type: "string",
              description: "Nombre de la imagen Docker (ej: nginx, redis:7, postgres:15)",
            },
            count: {
              type: "number",
              description: "Número de contenedores a crear",
            },
            port: {
              type: "number",
              description: "Puerto base a exponer",
            },
          },
          required: ["image", "count", "port"],
        },
      },
      {
        name: "list_containers",
        description: "Lista todos los contenedores Docker activos",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "delete_container",
        description: "Elimina un contenedor Docker por nombre",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nombre del contenedor a eliminar",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

// Manejador principal para ejecutar las herramientas cuando son llamadas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Herramienta para crear múltiples contenedores
    if (name === "create_containers") {
      const { image, count, port } = args;
      
      // Crear directorio temporal para el Dockerfile
      const tempDir = path.join(process.cwd(), "temp_docker");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      // Generar Dockerfile básico con la imagen especificada
      const dockerfilePath = path.join(tempDir, "Dockerfile");
      const dockerfile = `FROM ${image}\nEXPOSE ${port}\n`;
      fs.writeFileSync(dockerfilePath, dockerfile);

      // Construir la imagen Docker
      execSync(`docker build -t ai-container "${tempDir}"`, { stdio: "inherit" });

      // Crear los contenedores solicitados con puertos incrementales
      const created = [];
      for (let i = 0; i < count; i++) {
        const containerName = `ai_container_${i}`;
        const hostPort = port + i; // Puerto incremental para evitar conflictos
        execSync(
          `docker run -d -p ${hostPort}:${port} --name "${containerName}" ai-container`,
          { stdio: "inherit" }
        );
        created.push({ name: containerName, port: hostPort });
      }

      // Retornar resultado exitoso con detalles de los contenedores creados
      return {
        content: [
          {
            type: "text",
            text: `✅ Creados ${count} contenedores:\n${created.map(c => `- ${c.name} en puerto ${c.port}`).join("\n")}`,
          },
        ],
      };
    }

    // Herramienta para listar contenedores activos
    if (name === "list_containers") {
      // Ejecutar comando docker ps con formato personalizado
      const output = execSync('docker ps --format "{{.Names}} | {{.Image}} | {{.Ports}}"', {
        encoding: "utf-8",
      });
      
      return {
        content: [
          {
            type: "text",
            text: output.trim() || "📦 No hay contenedores activos en este momento",
          },
        ],
      };
    }

    // Herramienta para eliminar un contenedor específico
    if (name === "delete_container") {
      const { name: containerName } = args;
      // Forzar eliminación del contenedor (incluso si está corriendo)
      execSync(`docker rm -f ${containerName}`, { stdio: "inherit" });
      
      return {
        content: [
          {
            type: "text",
            text: `✅ Contenedor ${containerName} eliminado`,
          },
        ],
      };
    }

    // Si se llama una herramienta no reconocida
    throw new Error(`Herramienta desconocida: ${name}`);
  } catch (error) {
    // Manejo de errores: retornar mensaje de error al cliente
    return {
      content: [
        {
          type: "text",
          text: `❌ Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Función principal para inicializar el servidor MCP
async function main() {
  // Crear transporte de comunicación por stdio (entrada/salida estándar)
  const transport = new StdioServerTransport();
  // Conectar el servidor al transporte
  await server.connect(transport);
  console.error("Servidor MCP Docker iniciado");
}

// Ejecutar el servidor
main();
