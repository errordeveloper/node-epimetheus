const client = require('prom-client');
const labels = require('./labels');
const metric = {
  http: {
    requests: {
      duration: new client.Summary('http_request_duration_seconds', 'request duration in milliseconds', ['method', 'path', 'cardinality', 'status']),
      buckets: new client.Histogram('http_request_buckets_seconds', 'request duration buckets in milliseconds. Bucket size set to 500 and 2000 ms to enable apdex calculations with a T of 300ms', ['method', 'path', 'cardinality', 'status'], { buckets: [ 500, 2000 ] })
    }
  },
}

function observe(method, path, statusCode, start) {
  var path = path.toLowerCase();
  if (path !== '/metrics' && path !== '/metrics/') {
    var diff = process.hrtime(start);
    var duration = diff[0] + (diff[1] / 1000000000.0);
    var method = method.toLowerCase();
    var split = labels.parse(path);
    metric.http.requests.duration.labels(method, split.path, split.cardinality, statusCode).observe(duration);
    metric.http.requests.buckets.labels(method, split.path, split.cardinality, statusCode).observe(duration);
  }
};

client.collectDefaultMetrics();

module.exports = {
  observe: observe,
  render: () => { return client.register.metrics(); },
};
