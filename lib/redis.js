import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  tls: true
});

export default redis;
