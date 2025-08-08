import { statusToKeyWord } from './utils.js';

export const sendStreamResponse =async (stream, status, type, socket) =>  {
  try {
    let contentLength = null;

    // If the stream has a known size (e.g., a file), you can pre-calculate
    if (stream.path) {
      // When it's a file stream, we can get size from fs.statSync
      const fs = await import('fs');
      const stat = fs.statSync(stream.path);
      contentLength = stat.size;
    }

    // Prepare HTTP headers
    const headers =
`HTTP/1.1 ${status} ${statusToKeyWord(status)}
Content-Type: ${type}
${contentLength !== null ? `Content-Length: ${contentLength}\n` : ''}
Connection: Keep-Alive
Keep-Alive: timeout=10

`;

    // Write headers first
    socket.write(headers);

    // Pipe stream into the socket
    stream.pipe(socket, { end: false });

    // End the connection when stream finishes
    stream.on('end', () => {
      socket.end();
    });

    return 0;
  } catch (err) {
    console.error('Error sending stream response:', err);

    return 1;
  }
};
