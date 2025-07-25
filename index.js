const {parseHttpText,parseUrl,sendResponse}=require('./utils')
const net = require('node:net');
const {routes}=require('./routes')

// Create the server
const server = net.createServer((socket) => {
  socket.on('data',(data)=>{
    const {path,queryParams,protocol,action,headers}=parseHttpText(data.toString())
    if (!routes.includes(path)){
      const res={status:404,message:'Route not found'}

      socket.write(sendResponse(JSON.stringify(res),404,'application/json' ))
      return
    }
     const response =sendResponse(JSON.stringify({test:'hi'}),200,'json') 
    socket.write(response)
  })
  socket.on('end', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
