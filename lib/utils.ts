import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Builder } from "xml2js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ArrayObject {
  [key: string]: string  | string[];
}

interface ArrayItem {
  key: string;
  value: string | string[];
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
      version: "1.0",
      encoding: "UTF-8",
    },
    rootName: "XmlInputConsulta",
    headless: false,
    renderOpts: { pretty: false },
  });

  const xml = builder.buildObject(obj);

  const namespaces =
    ' xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
  const xmlWithNamespaces = xml.replace("<XmlInputConsulta>", `<XmlInputConsulta ${namespaces}>`);
  return xmlWithNamespaces;
}

export function convertObjectToSOAP(rootName: string, obj: ArrayObject) {
  const builder = new Builder({
    xmldec: {
      version: "1.0",
      encoding: "UTF-8",
    },
    rootName,
    headless: false,
    renderOpts: { pretty: false },
  });

  const xml = builder.buildObject(obj);

  const namespaces =
    'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" ' +
    'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';

  const soapEnvelope = `
    <soap:Envelope ${namespaces}>
      <soap:Header/>
      <soap:Body>
        ${xml}
      </soap:Body>
    </soap:Envelope>
  `;

  return soapEnvelope.trim();
}

export function identifyFormat(data: string): string {
  try {
    JSON.parse(data);
    return "JSON";
  } catch (e) {
    // Se der erro no parse, não é JSON
  }

  const trimmedData = data.trim();
  const isXML = trimmedData.startsWith("<") && trimmedData.endsWith(">");
  if (isXML) {
    // Verifica se é SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(trimmedData, "application/xml");
    const isSOAP = xmlDoc.getElementsByTagNameNS("http://schemas.xmlsoap.org/soap/envelope/", "Envelope").length > 0 ||
                   xmlDoc.getElementsByTagNameNS("http://www.w3.org/2003/05/soap-envelope", "Envelope").length > 0;
    if (isSOAP) {
      return "SOAP";
    }
    return "XML";
  }

  return "Unknown format";
}

export function priceFormat(value: number) {
  return new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(value)
}
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function executedFunction(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}