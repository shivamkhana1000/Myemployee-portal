import pool from '../db/pool';

export interface HistoricalSolution {
  id: number;
  problem_description: string;
  resolution: string;
}

export async function searchSolutions(query: string): Promise<HistoricalSolution[]> {
  if (!query || query.trim() === '') return [];

  // Convert "I have a printer issue" to a tsquery friendly format: "printer | issue"
  // Keep it simple: clean alphanumeric words, join with '&' for tsquery.
  // We will also use ILIKE as a fallback if tsquery is too strict, but full-text is better.
  
  const words = query.trim().split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return [];
  
  // Use plainto_tsquery which automatically ANDs the words, making it robust against special chars
  // Since we want OR semantics (any matching word), we can manually construct it, but plainto_tsquery is safer.
  // Actually, websearch_to_tsquery allows simple Google-like syntax.
  // Alternatively, just use ts_rank.
  
  const sql = `
    SELECT id, problem_description, resolution
    FROM historical_solutions
    WHERE to_tsvector('english', problem_description || ' ' || resolution) @@ websearch_to_tsquery('english', $1)
    ORDER BY ts_rank(to_tsvector('english', problem_description || ' ' || resolution), websearch_to_tsquery('english', $1)) DESC
    LIMIT 3;
  `;

  const result = await pool.query<HistoricalSolution>(sql, [query]);

  // If strict full text search yields nothing, do a simple ILIKE fallback on keywords.
  if (result.rows.length === 0) {
    const ilikeCondition = words.map((_, i) => `(problem_description ILIKE $${i + 1} OR resolution ILIKE $${i + 1})`).join(' OR ');
    const ilikeParams = words.map(w => `%${w}%`);
    
    const fallbackSql = `
      SELECT id, problem_description, resolution
      FROM historical_solutions
      WHERE ${ilikeCondition}
      LIMIT 3;
    `;
    const fallbackResult = await pool.query<HistoricalSolution>(fallbackSql, ilikeParams);
    return fallbackResult.rows;
  }

  return result.rows;
}
