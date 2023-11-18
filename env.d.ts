declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      IS_DEV: string;
      ADMIN_ID: number;
      NODE_ENV: 'development' | 'production';
      PORT?: string;
      PWD: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
