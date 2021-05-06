#### The Cache Feature

All Cache implements the [cache.ts](/src/cache.ts) interface. [map_cache.ts](/src/map_cache.ts) is the implementation used in the project. The cache is instantiated in [api_calls.ts](/src/api_calls.ts), and is centralized, all API strategies use this cache.

The cache is passed to the strategies through the ```getResponse``` function of the strategy. Each API strategy generates it's own unqiue caching ID based off of it's unique API ID. API IDs are generated for each API in [strategy_factory.ts](/src/strategy_factory.ts).

The [virus_total_strategy.ts](/src/virus_total_strategy.ts) has a unique method of caching. The other two API strategies [get_strategy.ts](/src/get_strategy.ts) and [post_strategy.ts](/src/post_strategy.ts) will immediately cache and serve API results. The [virus_total_strategy.ts](/src/virus_total_strategy.ts) must instead cache the initial result as a key for a future result, then the future results are cached and served to the user.