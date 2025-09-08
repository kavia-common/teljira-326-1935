class HealthService {
  // PUBLIC_INTERFACE
  /**
   * Get service health information.
   * @returns {{status:string,message:string,timestamp:string,environment:string}}
   */
  getStatus() {
    return {
      status: "ok",
      message: "Service is healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    };
  }
}

module.exports = new HealthService();
