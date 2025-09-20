interface Judge0Language {
  id: number;
  name: string;
}

interface Judge0Submission {
  language_id: number;
  source_code: string;
  stdin?: string;
}

interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

class Judge0Service {
  private readonly baseUrl = 'https://judge0-ce.p.rapidapi.com';
  private readonly headers = {
    'Content-Type': 'application/json',
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
  };

  private getApiKey(): string {
    // In a real Supabase environment, this would come from edge functions
    // For now, we'll use a placeholder that should be replaced with actual API key
    return import.meta.env.RAPIDAPI_KEY || 'your-rapidapi-key-here';
  }

  async getLanguages(): Promise<Judge0Language[]> {
    try {
      const response = await fetch(`${this.baseUrl}/languages`, {
        method: 'GET',
        headers: {
          ...this.headers,
          'X-RapidAPI-Key': this.getApiKey()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching languages:', error);
      // Return fallback languages if API fails
      return [
        { id: 71, name: 'Python (3.8.1)' },
        { id: 54, name: 'C++ (GCC 9.2.0)' },
        { id: 62, name: 'Java (OpenJDK 13.0.1)' },
        { id: 63, name: 'JavaScript (Node.js 12.14.0)' },
        { id: 50, name: 'C (GCC 9.2.0)' },
        { id: 74, name: 'TypeScript (3.7.4)' }
      ];
    }
  }

  async executeCode(submission: Judge0Submission): Promise<Judge0Response> {
    try {
      const response = await fetch(`${this.baseUrl}/submissions`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'X-RapidAPI-Key': this.getApiKey()
        },
        body: JSON.stringify(submission)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  }

  async executeCodeWithWait(submission: Judge0Submission): Promise<Judge0Response> {
    try {
      const response = await fetch(`${this.baseUrl}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'X-RapidAPI-Key': this.getApiKey()
        },
        body: JSON.stringify(submission)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing code with wait:', error);
      throw error;
    }
  }
}

export const judge0Service = new Judge0Service();
export type { Judge0Language, Judge0Submission, Judge0Response };