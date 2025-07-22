const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;

export const reviewCode = async (code: string, language: string = 'auto', tableStructures?: string, dataVolume?: string) => {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured. Please add VITE_DEEPSEEK_API_KEY to your environment variables.');
  }

  if (DEEPSEEK_API_KEY === 'your_deepseek_api_key') {
    throw new Error('Please replace the placeholder DeepSeek API key with your actual API key.');
  }

  let prompt: string;
  
  if (language === 'sql' && tableStructures && dataVolume) {
    prompt = `As a senior database developer and SQL expert, please analyze the following SQL query and provide a comprehensive review:

SQL Query:
${code}

Production Database Context:
${tableStructures}

Current Data Volumes:
${dataVolume}

Please provide a comprehensive analysis considering the actual production environment:
1. **Query Analysis**: Evaluate the SQL syntax, logic, and structure
2. **Performance Review**: Analyze performance implications based on the ACTUAL data volumes provided (${dataVolume.split('\n')[0]})
3. **Index Usage**: Review if the query efficiently uses the EXISTING indexes shown in the table schemas
4. **Optimization Suggestions**: Recommend specific improvements considering the current table structures and data load
5. **Security Assessment**: Check for SQL injection risks and security best practices
6. **Production Impact**: Assess the impact on production systems based on the REAL data volumes and table sizes provided
7. **Best Practices**: Suggest improvements following SQL best practices
8. **Alternative Approaches**: Provide alternative query structures if applicable
9. **Risk Assessment**: Identify potential risks when running this query against the actual production data volumes
10. **Overall Score**: Rate the query from 1-10 with detailed justification

IMPORTANT: Base your analysis on the ACTUAL production data provided:
- Table structures with real column definitions and existing indexes
- Current data volumes and growth patterns
- Performance metrics from the live environment

Format your response in clear sections with markdown formatting.`;
  } else {
    prompt = `As a senior code reviewer, please analyze the following ${language} code and provide a comprehensive review:

${code}

Please provide:
1. **Overall Code Score**: Rate the code from 1-10 and provide a brief summary of code quality
2. **Issues Found**: List any bugs, security vulnerabilities, or problems
3. **Code Quality**: Comments on readability, maintainability, and best practices
4. **Performance**: Any performance concerns or optimizations
5. **Recommendations**: Specific suggestions for improvement
6. **Security**: Security-related observations
7. **Final Score Breakdown**: Detailed scoring breakdown with justification

Format your response in clear sections with markdown formatting.`;
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-coder',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `DeepSeek API error (${response.status}): ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage = `DeepSeek API error: ${errorData.error.message}`;
        }
      } catch (e) {
        // If we can't parse the error, use the status text
        if (errorText) {
          errorMessage = `DeepSeek API error: ${errorText}`;
        }
      }

      // Handle specific error cases
      if (response.status === 401) {
        errorMessage = 'Invalid DeepSeek API key. Please check your API key configuration.';
      } else if (response.status === 429) {
        errorMessage = 'DeepSeek API rate limit exceeded. Please try again later.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid request to DeepSeek API. Please check your code input.';
      } else if (errorText.includes('Insufficient Balance')) {
        errorMessage = 'DeepSeek API account has insufficient balance. Please add credits to your DeepSeek account at https://platform.deepseek.com/ to continue using code reviews.';
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Unable to connect to DeepSeek API. Please check your internet connection.');
  }
};