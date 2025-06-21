
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Save, Download, RotateCcw } from 'lucide-react';

const CodeCompiler = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState('# Write your Python code here\nprint("Hello, World!")');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const languages = [
    { value: 'python', label: 'Python', extension: '.py', defaultCode: '# Write your Python code here\nprint("Hello, World!")' },
    { value: 'java', label: 'Java', extension: '.java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
    { value: 'c', label: 'C', extension: '.c', defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
    { value: 'cpp', label: 'C++', extension: '.cpp', defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}' },
    { value: 'javascript', label: 'JavaScript', extension: '.js', defaultCode: '// Write your JavaScript code here\nconsole.log("Hello, World!");' },
    { value: 'typescript', label: 'TypeScript', extension: '.ts', defaultCode: '// Write your TypeScript code here\nconsole.log("Hello, World!");' },
  ];

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    const selectedLang = languages.find(lang => lang.value === language);
    if (selectedLang) {
      setCode(selectedLang.defaultCode);
    }
    setOutput('');
  };

  const runCode = () => {
    setIsRunning(true);
    // Simulate code execution
    setTimeout(() => {
      setOutput(`Output for ${selectedLanguage}:\nHello, World!\n\nExecution completed successfully.`);
      setIsRunning(false);
    }, 2000);
  };

  const resetCode = () => {
    const selectedLang = languages.find(lang => lang.value === selectedLanguage);
    if (selectedLang) {
      setCode(selectedLang.defaultCode);
    }
    setOutput('');
  };

  const saveCode = () => {
    // Simulate saving code
    alert('Code saved successfully!');
  };

  const downloadCode = () => {
    const selectedLang = languages.find(lang => lang.value === selectedLanguage);
    const fileName = `code${selectedLang?.extension || '.txt'}`;
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
            <label className="text-sm font-medium text-gray-700">Programming Language</label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-48 mt-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline" className="mt-6">
            {languages.find(lang => lang.value === selectedLanguage)?.extension}
          </Badge>
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
            <CardDescription>Write your {languages.find(lang => lang.value === selectedLanguage)?.label} code here</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code here..."
              className="min-h-[400px] font-mono text-sm"
            />
            <div className="mt-4">
              <Button onClick={runCode} disabled={isRunning} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>Code execution results will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-md min-h-[400px] font-mono text-sm">
              {output || 'No output yet. Run your code to see results.'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Examples</CardTitle>
          <CardDescription>Common programming examples to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 text-left">
              <div>
                <div className="font-medium">Hello World</div>
                <div className="text-sm text-gray-500">Basic output example</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left">
              <div>
                <div className="font-medium">Variables & Data Types</div>
                <div className="text-sm text-gray-500">Working with variables</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 text-left">
              <div>
                <div className="font-medium">Control Structures</div>
                <div className="text-sm text-gray-500">If-else, loops, etc.</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeCompiler;
