import { Controller } from 'core/infra/Controller';
import { FastifyReply, FastifyRequest } from 'fastify';

export function fastifyAdapter(controller: Controller) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const httpResponse = await controller.handle(
      request.body || request.params || request.query || request.headers);

    reply.code(httpResponse.statusCode);
    return httpResponse.body;
  };
}

// export function fastifyAdapter(controller: Controller) {
//   return async (request: FastifyRequest, reply: FastifyReply) => {
//     const httpRequest = {
//       body: request.body,
//       params: request.params,
//       query: request.query,
//       headers: request.headers,
//       // ip: request.ip,
//     };

//     const httpResponse = await controller.handle(httpRequest);
//     reply.code(httpResponse.statusCode);
//     return httpResponse.body;
//   };
// }