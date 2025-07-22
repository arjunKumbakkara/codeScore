import React from 'react';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

export const CodeSafetySection: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 mt-12">
      <div className="flex items-center mb-6">
        <div className="bg-amber-100 p-3 rounded-full mr-4">
          <AlertTriangle className="text-amber-600" size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-amber-900 mb-1">
            ⚠️ Code Safety & Privacy Notice
          </h2>
          <p className="text-amber-700">
            Important information about your code security and data handling
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
          <div className="flex items-center mb-4">
            <Shield className="text-green-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">What We Protect</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <span>Your code remains <strong>proprietary</strong> and confidential</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <span>No explicit logging or permanent storage beyond user accounts</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <span>Secure transmission using HTTPS encryption</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <span>Row-level security on all database operations</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
          <div className="flex items-center mb-4">
            <Eye className="text-blue-600 mr-3" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Data Processing</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <Lock className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <span>Code is processed by <strong>AI models</strong> for analysis only</span>
            </li>
            <li className="flex items-start">
              <Lock className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <span>Analysis results stored in your secure user account</span>
            </li>
            <li className="flex items-start">
              <Lock className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <span>Only you can access your code reviews and history</span>
            </li>
            <li className="flex items-start">
              <Lock className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
              <span>Shared reports are generated on-demand with your consent</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start">
          <AlertTriangle className="text-red-600 mr-3 mt-1 flex-shrink-0" size={20} />
          <div>
            <h4 className="font-semibold text-red-900 mb-2">Important Disclaimers</h4>
            <div className="text-sm text-red-800 space-y-2">
              <p>
                <strong>Third-Party AI Processing:</strong> Your code is processed by third-party AI models for analysis. 
                While we don't explicitly log or save your code beyond your user account, the underlying LLM engine 
                may process your code according to their own privacy policies.
              </p>
              <p>
                <strong>Sensitive Code Warning:</strong> Avoid submitting highly sensitive, classified, or 
                production-critical code that contains secrets, API keys, passwords, or proprietary algorithms.
              </p>
              <p>
                <strong>Sharing Responsibility:</strong> When you generate shareable reports, you are responsible 
                for ensuring the shared content doesn't violate your organization\'s security policies.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-amber-700">
          By using CodeScore, you acknowledge that you understand these privacy considerations and 
          agree to use the service responsibly with appropriate code that doesn't compromise security.
        </p>
      </div>
    </div>
  );
};