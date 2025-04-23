interface ProcessStepsProps {
  currentStep: number;
}

export default function ProcessSteps({ currentStep }: ProcessStepsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        <div className="flex items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            1
          </div>
          <div className={`mx-2 h-1 w-12 ${
            currentStep >= 2 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
          }`}></div>
        </div>
        <div className="flex items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            2
          </div>
          <div className={`mx-2 h-1 w-12 ${
            currentStep >= 3 ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
          }`}></div>
        </div>
        <div className="flex items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            3
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-1 text-sm text-gray-600 dark:text-gray-400">
        <div className={currentStep >= 1 ? 'text-primary-600 dark:text-primary-400 font-medium' : ''}>Upload Document</div>
        <div className={currentStep >= 2 ? 'text-primary-600 dark:text-primary-400 font-medium' : ''}>Processing</div>
        <div className={currentStep >= 3 ? 'text-primary-600 dark:text-primary-400 font-medium' : ''}>Analysis Results</div>
      </div>
    </div>
  );
}
