"use client";
import { useIndustryOnboardingStore } from "@/stores/industryOnboardingStore";
import { Button } from "@/components/ui/Button";

export default function BusinessVerificationStep() {
  const { setStep, currentStep, documents, addDocument, removeDocument } = useIndustryOnboardingStore();

  const handleNext = () => setStep(currentStep + 1);
  const handleBack = () => setStep(currentStep - 1);

  const handleUpload = () => {
    addDocument({ docType: "GST Certificate", fileUrl: "https://example.com/doc.pdf", fileName: "gst-certificate.pdf" });
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-grow space-y-4">
        <h3 className="text-xl font-semibold">Business Verification</h3>
        <p className="text-sm text-gray-500">Upload your business documents for verification.</p>
        
        <div className="border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4">
          <p>Drag and drop documents here or click to upload</p>
          <Button variant="outline" onClick={handleUpload}>Upload Document</Button>
        </div>

        {documents.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="font-medium">Uploaded Documents</h4>
            {documents.map((doc, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
                <span>{doc.fileName} ({doc.docType})</span>
                <Button variant="danger" size="sm" onClick={() => removeDocument(doc.docType)}>Remove</Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={handleBack}>Back</Button>
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
