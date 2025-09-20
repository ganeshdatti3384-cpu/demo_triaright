
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Play, Save, Download, RotateCcw, Clock, MemoryStick } from 'lucide-react';
import { judge0Service, Judge0Language } from '@/services/judge0Api';
import { useToast } from '@/hooks/use-toast';

const CodeCompiler = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('71'); // Python by default
  const [code, setCode] = useState('# Write your Python code here\nprint("Hello, World!")');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Judge0Language[]>([]);
  const [executionTime, setExecutionTime] = useState<string | null>(null);
  const [memoryUsed, setMemoryUsed] = useState<number | null>(null);
  const { toast } = useToast();

  const languageDefaults: Record<string, { defaultCode: string; extension: string }> = {
    '71': { // Python
      defaultCode: '# Write your Python code here\nname = input("Enter your name: ")\nprint(f"Hello, {name}!")',
      extension: '.py'
    },
    '54': { // C++
      defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    string name;\n    cout << "Enter your name: ";\n    cin >> name;\n    cout << "Hello, " << name << "!" << endl;\n    return 0;\n}',
      extension: '.cpp'
    },
    '62': { // Java
      defaultCode: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + "!");\n        scanner.close();\n    }\n}',
      extension: '.java'
    },
    '63': { // JavaScript
      defaultCode: '// Write your JavaScript code here\nconst readline = require("readline");\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.question("Enter your name: ", (name) => {\n    console.log(`Hello, ${name}!`);\n    rl.close();\n});',
      extension: '.js'
    },
    '50': { // C
      defaultCode: '#include <stdio.h>\n\nint main() {\n    char name[100];\n    printf("Enter your name: ");\n    scanf("%s", name);\n    printf("Hello, %s!\\n", name);\n    return 0;\n}',
      extension: '.c'
    },
    '74': { // TypeScript
      defaultCode: '// Write your TypeScript code here\nconst name: string = "World";\nconsole.log(`Hello, ${name}!`);',
      extension: '.ts'
    }
  };

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const languages = await judge0Service.getLanguages();
        setAvailableLanguages(languages);
      } catch (error) {
        console.error('Failed to load languages:', error);
        toast({
          title: "Error",
          description: "Failed to load programming languages. Using default languages.",
          variant: "destructive"
        });
      }
    };

    loadLanguages();
  }, [toast]);

  const handleLanguageChange = (languageId: string) => {
    setSelectedLanguage(languageId);
    const defaults = languageDefaults[languageId];
    if (defaults) {
      setCode(defaults.defaultCode);
    }
    setOutput('');
    setStdin('');
    setExecutionTime(null);
    setMemoryUsed(null);
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter some code to execute.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setOutput('');
    setExecutionTime(null);
    setMemoryUsed(null);

    try {
      const submission = {
        language_id: parseInt(selectedLanguage),
        source_code: code,
        stdin: stdin || undefined
      };

      const result = await judge0Service.executeCodeWithWait(submission);
      
      let outputText = '';
      
      if (result.compile_output) {
        outputText += `Compilation Error:\n${result.compile_output}\n\n`;
      }
      
      if (result.stderr) {
        outputText += `Runtime Error:\n${result.stderr}\n\n`;
      }
      
      if (result.stdout) {
        outputText += `Output:\n${result.stdout}\n\n`;
      }
      
      outputText += `Status: ${result.status.description}\n`;
      
      if (result.time) {
        outputText += `Execution Time: ${result.time}s\n`;
        setExecutionTime(result.time);
      }
      
      if (result.memory) {
        outputText += `Memory Used: ${(result.memory / 1024).toFixed(2)} KB\n`;
        setMemoryUsed(result.memory);
      }

      if (!result.stdout && !result.stderr && !result.compile_output) {
        outputText += 'No output generated.';
      }

      setOutput(outputText);

      if (result.status.description === 'Accepted') {
        toast({
          title: "Success",
          description: "Code executed successfully!",
        });
      }
    } catch (error) {
      console.error('Code execution failed:', error);
      setOutput(`Error: Failed to execute code. Please check your API configuration.\n\nDetails: ${error}`);
      toast({
        title: "Execution Failed",
        description: "Failed to execute code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    const defaults = languageDefaults[selectedLanguage];
    if (defaults) {
      setCode(defaults.defaultCode);
    }
    setOutput('');
    setStdin('');
    setExecutionTime(null);
    setMemoryUsed(null);
  };

  const saveCode = () => {
    // Simulate saving code
    alert('Code saved successfully!');
  };

  const downloadCode = () => {
    const defaults = languageDefaults[selectedLanguage];
    const fileName = `code${defaults?.extension || '.txt'}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <label className="text-sm font-medium">Programming Language</label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-48 mt-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id.toString()}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="mt-6">
            {languageDefaults[selectedLanguage]?.extension || '.txt'}
          </Badge>
          {executionTime && (
            <Badge variant="secondary" className="mt-6 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {executionTime}s
            </Badge>
          )}
          {memoryUsed && (
            <Badge variant="secondary" className="mt-6 flex items-center gap-1">
              <MemoryStick className="h-3 w-3" />
              {(memoryUsed / 1024).toFixed(2)} KB
            </Badge>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={resetCode}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={saveCode}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCode}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Code Editor</CardTitle>
            <CardDescription>
              Write your {availableLanguages.find(lang => lang.id.toString() === selectedLanguage)?.name || 'code'} here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code here..."
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Input (stdin) - Optional</label>
                <Input
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter input for your program..."
                  className="mt-1 font-mono text-sm"
                />
              </div>
              <Button onClick={runCode} disabled={isRunning} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Executing...' : 'Run Code'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle>Output & Results</CardTitle>
            <CardDescription>Code execution results, errors, and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-md min-h-[400px] font-mono text-sm whitespace-pre-wrap overflow-auto">
              {output || 'No output yet. Run your code to see results.\n\nTip: You can provide input in the stdin field above if your program requires user input.'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Examples</CardTitle>
          <CardDescription>Load common programming examples to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              onClick={() => {
                const defaults = languageDefaults[selectedLanguage];
                if (defaults) {
                  setCode(defaults.defaultCode);
                  setStdin('World');
                }
              }}
            >
              <div>
                <div className="font-medium">Interactive Hello</div>
                <div className="text-sm text-muted-foreground">Input/output example</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              onClick={() => {
                const examples = {
                  '71': 'numbers = [1, 2, 3, 4, 5]\nfor num in numbers:\n    print(f"Square of {num} is {num**2}")',
                  '54': '#include <iostream>\nusing namespace std;\n\nint main() {\n    for(int i = 1; i <= 5; i++) {\n        cout << "Square of " << i << " is " << i*i << endl;\n    }\n    return 0;\n}',
                  '62': 'public class Main {\n    public static void main(String[] args) {\n        for(int i = 1; i <= 5; i++) {\n            System.out.println("Square of " + i + " is " + (i*i));\n        }\n    }\n}',
                  '63': 'for(let i = 1; i <= 5; i++) {\n    console.log(`Square of ${i} is ${i*i}`);\n}'
                };
                setCode(examples[selectedLanguage as keyof typeof examples] || examples['71']);
                setStdin('');
              }}
            >
              <div>
                <div className="font-medium">Loops & Arrays</div>
                <div className="text-sm text-muted-foreground">Control structures</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left"
              onClick={() => {
                const examples = {
                  '71': 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)\n\nnum = int(input("Enter a number: "))\nprint(f"Factorial of {num} is {factorial(num)}")',
                  '54': '#include <iostream>\nusing namespace std;\n\nint factorial(int n) {\n    if(n <= 1) return 1;\n    return n * factorial(n-1);\n}\n\nint main() {\n    int num;\n    cout << "Enter a number: ";\n    cin >> num;\n    cout << "Factorial of " << num << " is " << factorial(num) << endl;\n    return 0;\n}',
                  '62': 'import java.util.Scanner;\n\npublic class Main {\n    static int factorial(int n) {\n        if(n <= 1) return 1;\n        return n * factorial(n-1);\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.print("Enter a number: ");\n        int num = sc.nextInt();\n        System.out.println("Factorial of " + num + " is " + factorial(num));\n        sc.close();\n    }\n}',
                  '63': 'function factorial(n) {\n    if(n <= 1) return 1;\n    return n * factorial(n-1);\n}\n\nconst readline = require("readline");\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.question("Enter a number: ", (answer) => {\n    const num = parseInt(answer);\n    console.log(`Factorial of ${num} is ${factorial(num)}`);\n    rl.close();\n});'
                };
                setCode(examples[selectedLanguage as keyof typeof examples] || examples['71']);
                setStdin('5');
              }}
            >
              <div>
                <div className="font-medium">Functions</div>
                <div className="text-sm text-muted-foreground">Recursive functions</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeCompiler;
