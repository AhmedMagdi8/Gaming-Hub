import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { join } from 'path';
import { existsSync, promises } from 'fs';

export const applyMiddlewares = (app: express.Application) => {
  app.use(cors());
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  const uploadsFolder = join(__dirname, '../uploads');
  if (!existsSync(uploadsFolder)) {
    (async () => {
      await promises.mkdir(uploadsFolder);
    })();
  }

  app.use(express.static('uploads'));
};
