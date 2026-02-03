import { HuntXLogo } from './components/HuntXLogo';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        <div>
          <h2 className="mb-8 text-gray-600">Primary Logo - Light Background</h2>
          <div className="bg-white p-12 rounded-lg shadow-sm flex justify-center">
            <HuntXLogo variant="primary" size="large" />
          </div>
        </div>

        <div>
          <h2 className="mb-8 text-gray-600">Dark Background Version</h2>
          <div className="bg-black p-12 rounded-lg flex justify-center">
            <HuntXLogo variant="dark" size="large" />
          </div>
        </div>

        <div>
          <h2 className="mb-8 text-gray-600">Orange Background</h2>
          <div className="p-12 rounded-lg flex justify-center" style={{ backgroundColor: '#FF6B00' }}>
            <HuntXLogo variant="orange-bg" size="large" />
          </div>
        </div>

        <div>
          <h2 className="mb-8 text-gray-600">Horizontal Lockup</h2>
          <div className="bg-white p-12 rounded-lg shadow-sm flex justify-center">
            <HuntXLogo variant="horizontal" size="large" />
          </div>
        </div>

        <div>
          <h2 className="mb-8 text-gray-600">Stacked Layout</h2>
          <div className="bg-white p-12 rounded-lg shadow-sm flex justify-center">
            <HuntXLogo variant="stacked" size="large" />
          </div>
        </div>

        <div>
          <h2 className="mb-8 text-gray-600">Icon Only Variations</h2>
          <div className="bg-white p-12 rounded-lg shadow-sm flex gap-8 justify-center items-center">
            <HuntXLogo variant="icon" size="large" />
            <HuntXLogo variant="icon" size="medium" />
            <HuntXLogo variant="icon" size="small" />
          </div>
        </div>

        <div>
          <h2 className="mb-8 text-gray-600">Responsive Sizes</h2>
          <div className="bg-white p-12 rounded-lg shadow-sm space-y-6 flex flex-col items-center">
            <HuntXLogo variant="horizontal" size="small" />
            <HuntXLogo variant="horizontal" size="medium" />
            <HuntXLogo variant="horizontal" size="large" />
          </div>
        </div>
      </div>
    </div>
  );
}