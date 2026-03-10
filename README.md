# Docker MCP Server

Servidor MCP para controlar Docker con lenguaje natural usando Cline y modelos gratuitos.
Esta demostración trata de simular la automatización de la orquestación de contenedores en Docker.

## Instalación

```bash
npm install
```

## Configuración

### 1. Instalar Cline en VS Code
- Abre VS Code
- Ve a Extensiones (Ctrl+Shift+X)
- Busca "Cline" e instálalo

### 2. Configurar modelo gratuito
Crea/edita `%USERPROFILE%\.continue\config.json`:

```json
{
  "models": [
    {
      "title": "Kat Coder Pro",
      "provider": "openai",
      "model": "kat-coder-pro",
      "apiBase": "https://api.kat.ai/v1"
    }
  ],
  "mcpServers": {
    "docker": {
      "command": "node",
      "args": ["C:\\Users\\Rodri\\OneDrive\\Desktop\\Docker-MCP\\app\\index.js"]
    }
  }
}
```

### 3. Configurar Cline MCP
En VS Code, abre Cline → Settings → MCP Servers y pega:

```json
{
  "mcpServers": {
    "docker": {
      "command": "node",
      "args": ["C:\\Users\\Rodri\\OneDrive\\Desktop\\Docker-MCP\\app\\index.js"]
    }
  }
}
```

## Uso

1. Abre Cline en VS Code
2. Escribe comandos en lenguaje natural

## Herramientas disponibles

- **create_containers**: Crea múltiples contenedores Docker
- **list_containers**: Lista todos los contenedores activos
- **delete_container**: Elimina un contenedor por nombre

## Ejemplos de prompts

- "Crea 3 contenedores de nginx en el puerto 8080"
- "Lista todos los contenedores"
- "Elimina el contenedor ai_container_0"
- "Crea 2 contenedores de redis en el puerto 6379"

## Casos de uso y manejo de errores

### ✅ Casos exitosos
- **Prompt completo**: "Crea 2 contenedores de nginx en puerto 8080"
- **Imagen con versión**: "Crea 1 contenedor de postgres:15 en puerto 5432"
- **Eliminar contenedor**: "Elimina el contenedor ai_container_1"

### ❌ Casos de error comunes

#### Parámetros faltantes
- **Prompt**: "Crea contenedores de nginx"
- **Error**: El modelo debe solicitar puerto y cantidad
- **Solución**: Especificar todos los parámetros requeridos

#### Puerto ocupado
- **Problema**: Crear contenedores en puerto ya usado
- **Comportamiento**: Los puertos se incrementan automáticamente (8080, 8081, 8082...)
- **Ejemplo**: Si pides 3 contenedores en puerto 8080, se crean en 8080, 8081, 8082

#### Imagen inexistente
- **Prompt**: "Crea contenedor de imagen_falsa en puerto 3000"
- **Error**: Docker no puede descargar la imagen
- **Mensaje**: "❌ Error: [mensaje de Docker]"

#### Contenedor inexistente para eliminar
- **Prompt**: "Elimina el contenedor que_no_existe"
- **Error**: Docker no encuentra el contenedor
- **Mensaje**: "❌ Error: No such container: que_no_existe"

#### Docker no ejecutándose
- **Problema**: Docker Desktop cerrado
- **Error**: "Cannot connect to the Docker daemon"
- **Solución**: Iniciar Docker Desktop

### Validaciones automáticas

- **Parámetros requeridos**: image, count, port son obligatorios para crear contenedores
- **Tipos de datos**: count debe ser número, port debe ser número
- **Nombres únicos**: Los contenedores se nombran ai_container_0, ai_container_1, etc.
- **Puertos incrementales**: Evita conflictos de puertos automáticamente

## Requisitos

- Node.js instalado
- Docker Desktop ejecutándose
- VS Code con extensión Cline
