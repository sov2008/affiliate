export interface WebMCPToolDefinition<T = Record<string, unknown>> {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: T) => Promise<unknown> | unknown;
}

export interface ModelContextAPI {
  registerTool: (tool: WebMCPToolDefinition<any>) => void;
  unregisterTool?: (name: string) => void;
}

declare global {
  interface Document {
    modelContext?: ModelContextAPI;
  }

  interface Navigator {
    modelContext?: ModelContextAPI;
  }

  interface Window {
    __promoradar_webmcp_initialized?: boolean;
  }
}

