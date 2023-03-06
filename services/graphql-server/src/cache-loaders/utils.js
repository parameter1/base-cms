const cacheKeyPrefix = ({ tenant, loaderType }) => `base_gql_cache_loader:${tenant}:${loaderType}`;

const cacheKey = ({ tenant, loaderType, parts }) => `${cacheKeyPrefix({ tenant, loaderType })}:${parts.join(':')}`;

module.exports = { cacheKeyPrefix, cacheKey };
