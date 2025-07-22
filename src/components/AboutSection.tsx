import React from 'react';
import { Github, BookOpen, Code, Award, Users, Zap } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <img 
            src="/codescore-removebg-preview.png" 
            alt="CodeScore Logo" 
            className="h-48 w-auto"
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">About CodeScore</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          CodeScore is an AI-powered code review platform that helps developers improve their code quality 
          through comprehensive analysis and scoring. Built with cutting-edge AI technology to provide 
          instant, detailed feedback on your Java, JavaScript, and Python code.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-purple-50 rounded-xl">
          <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Zap className="text-purple-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Analysis</h3>
          <p className="text-gray-600">Get comprehensive code reviews in seconds with AI-powered insights</p>
        </div>

        <div className="text-center p-6 bg-blue-50 rounded-xl">
          <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Award className="text-blue-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Scoring</h3>
          <p className="text-gray-600">Receive detailed scores and recommendations for code improvement</p>
        </div>

        <div className="text-center p-6 bg-green-50 rounded-xl">
          <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Code className="text-green-600" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Language</h3>
          <p className="text-gray-600">Support for Java, JavaScript, Python, and more programming languages</p>
        </div>
      </div>


      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
        <div className="text-center">
          <Users className="mx-auto text-purple-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Join the Community</h3>
          <p className="text-gray-600 mb-4">
            CodeScore is designed to help developers at all levels improve their coding skills. 
            Get started today and see how AI can enhance your development workflow.
          </p>
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <span>✨ AI-Powered Reviews</span>
            <span>📊 Detailed Scoring</span>
            <span>📱 Mobile Friendly</span>
            <span>🔒 Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  );
};