
function parseHeaders(headers){
  const parsedHeader={}
  headers.forEach(element => {
    const [key,value]=element.trim().split(':');
    parsedHeader[key]=value
    

    
  });;
  
  return parsedHeader
}

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

export function parseUrl(url){
  const [path,queryParamsString]=url.split('?');  
  const queryParams=queryParamsString?parseQueryParams(queryParamsString.split('&')):[];
  return {
    path,
    queryParams
  }
  
  
}
export function parseHttpText(req){
  const [firstLine,...rest]=req.split('\n');

  const restJoined=rest.join('\n')

  

  const [headersRaw,body]=restJoined.split('\r\n\r\n');
  const headers=parseHeaders(headersRaw.split('\n'));
  const splittedFirstLine=firstLine.split(' ')
  const action=splittedFirstLine[0]  

  const protocol=splittedFirstLine[2]
  const url=splittedFirstLine[1]
  const {path,queryParams}=parseUrl(url)
 return {

     action,
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
export const sendResponse=(data,status,type)=>{
  return `HTTP/1.1 ${status} ${statusToKeyWord(status)}
Content-Type: ${type}
Content-Length: ${data.length}

${data}`;
}
