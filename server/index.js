
( async () => {
    try {
        const { start } = require('./lib/server');
        await start();
    } catch (error) {
        console.log('Failed to start Express server!', { error });
    }
})();
