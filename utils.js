import net from 'net';

import Logger from './logger.js';
const logger=new Logger('Utils')
/** 
  * @description parses the headers from the request 
 * @param {string} headers a string representing the headers of the request
* @returns {Object} an object with the headers as key value pairs
 * example
 * const headers='Host: localhost:3000\nUser-Agent: Mozilla/5.0\nAccept: text/html';
 * const parsed=parseHeaders(headers.split('\n'));
 * console.log(parsed);
 * Output: { Host: 'localhost:3000', 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' }
 * */
function parseHeaders(headers){
  const parsedHeader={}
  headers.forEach(element => {
    const [key,value]=element.trim().split(':');
    parsedHeader[key]=value
  });;
  
  return parsedHeader
}
/** * @description parses the query params from the request
 *
 * @param {string} raw string representing the query params of the request
 * @returns {Object} an object with the query params as key value pairs
 * @example 
 * const raw='name=John&age=30&hobbies=reading&hobbies=gaming';
 * const parsed=parseQueryParams(raw.split('&'));
 * console.log(parsed);
 * Output: { name: 'John', age: '30', hobbies: ['reading', 'gaming'] }  
 * */

function parseQueryParams(raw){
const parsedParams={}
  raw.forEach(element => {
    const [key,value]=element.trim().split('=');
    if (parsedParams[key]){
      if (Array.isArray(parsedParams[key])){
        parsedParams[key].push(value)
        return;
      }
      parsedParams[key]=[parsedParams[key],value]
      return;

    }
    parsedParams[key]=value
   
  });;
  
  return parsedParams

}

/**
 * @param {*} url 
 * @returns {path,queryParams}
 * @description parses the url into  a query params and a base path
 * * @example
 * const url='http://localhost:3000/api/users?name=John&age=30&hobbies=reading&hobbies=gaming';
 * const parsed=parseUrl(url);
 * console.log(parsed); 
 * Output: { path: 'http://localhost:3000/api/users', queryParams: { name: 'John', age: '30', hobbies: ['reading', 'gaming'] } }
 * */
export function parseUrl(url){
  const [path,queryParamsString]=url.split('?');  
  const queryParams=queryParamsString?parseQueryParams(queryParamsString.split('&')):[];
  return {
    path,
    queryParams
  }
  
  
}
/** @description parses the HTTP request text into an object
 *
 *   @param {string} req a string representing the HTTP request
 *   @returns {Object} an object with the parsed request
 * @example
 * const req='GET /api/users?name=John&age=30 HTTP/2
 * Host: localhost:3000
 * User-Agent: Mozilla/5.0
 * Accept: text/html
 * {"name":"John","age":30}';
 * const parsed=parseHttpText(req);
 * console.log(parsed);
 * Output: {
 *  action: 'GET',
 *  protocol: 'HTTP/2',
 *  path: '/api/users',
 *  queryParams: { name: 'John', age: '30' },
 *  headers: { Host: 'localhost:3000', 'User-Agent': 'Mozilla
 *  5.0', Accept: 'text/html' },
 *  body: '{"name":"John","age":30}'
 *  }
 *  */
export function parseHttpText(req){
    const [firstLine,...rest]=req.split('\n');

  const restJoined=rest.join('\n')

  

  const [headersRaw,body]=restJoined.split('\r\n\r\n');
  const headers=parseHeaders(headersRaw.split('\n'));
  const splittedFirstLine=firstLine.split(' ')
  const method=splittedFirstLine[0]  

  const protocol=splittedFirstLine[2]
  const url=splittedFirstLine[1]
  const {path,queryParams}=parseUrl(url)
 return {

   method,
   protocol,
   path,
   queryParams,
   headers,
   body

  }
 }

export const statusToKeyWord = (status) => {
  switch (status) {
    case 200:
      return 'OK';
    case 201:
      return 'CREATED';
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 500:
      return 'INTERNAL_SERVER_ERROR';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'UNKNOWN_STATUS';
  }
};

/**
 * @description   sends a response back to the client
 * @param {any} data the body  to send as a string 
 * @param {number} status the status code  to send
 * @param {string} type the content type of the response body
 * @param {net.Socket} socket the socket to send the response on
 
 
 * */
export const sendResponse=(data,status,type,socket)=>{
  try{
const res=`HTTP/1.1 ${status} ${statusToKeyWord(status)}
Content-Type: ${type}
Content-Length: ${data.length}
Connection: Keep-Alive
Keep-Alive: timeout=10

${data}`
  socket.write(res)
  return 0;

  }
  catch(err){
  
logger.error(`Error sending response: ${err.message}`);    
    return -1;


  }
  }
