export interface HistoricalSolution {
  id: number;
  problem_description: string;
  resolution: string;
}

export async function apiSearchSolutions(token: string, query: string): Promise<HistoricalSolution[]> {
  if (!query || query.trim() === '') return []
  
  const params = new URLSearchParams({ q: query })
  const res = await fetch(`/api/solutions/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? 'Search failed')
  return data.solutions
}
