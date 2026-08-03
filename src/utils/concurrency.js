async function runWithConcurrency(items, limit, worker) {

    let index = 0;

    async function runNext() {

        while (index < items.length) {

            const currentIndex = index++;

            await worker(items[currentIndex], currentIndex);

        }

    }

    const runners = [];

    for (let i = 0; i < Math.min(limit, items.length); i++) {
        runners.push(runNext());
    }

    await Promise.all(runners);

}

module.exports = {
    runWithConcurrency
};
