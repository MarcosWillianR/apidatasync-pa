import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Builder } from 'xml2js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ArrayObject {
  [key: string]: string;
}

interface ArrayItem {
  key: string;
  value: string;
}

export function convertArrayToJson(array: ArrayItem[]) {
  const response: ArrayObject = {};

  array.forEach((item) => {
    response[item.key] = item.value;
  });

  return response;
}

export function convertObjectToXML(obj: ArrayObject) {
  const builder = new Builder({
      xmldec: {
          version: '1.0',
          encoding: 'UTF-8'
      },
      rootName: 'XmlInputConsulta',
      headless: false,
      renderOpts: { pretty: false }
  });

  const xml = builder.buildObject(obj);

  const namespaces = ' xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
  const xmlWithNamespaces = xml.replace('<XmlInputConsulta>', `<XmlInputConsulta ${namespaces}>`);
  return xmlWithNamespaces;
}