import { useParams } from 'react-router-dom';

export default function JobDetails() {
  const { id } = useParams();
  
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <h1 className="text-3xl font-bold mb-4">Job Details</h1>
      <p className="text-gray-600 mb-6">Viewing details for job ID: {id}</p>
      <div className="prose max-w-none">
        <p>This is a demo placeholder for the Job Details page. The AI vector embedding will use the text content shown here to perform semantic searches.</p>
      </div>
    </div>
  );
}
