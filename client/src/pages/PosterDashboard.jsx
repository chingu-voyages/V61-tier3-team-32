import React from 'react';
import { PlusCircle, Clock, Leaf, Package, Check } from 'lucide-react';

const statCard = (icon, label, value) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm flex-1 min-w-[220px]">
    <div className="flex items-center gap-3 text-sm text-mid-gray">
      {icon}
      <span className="uppercase text-xs tracking-wide">{label}</span>
    </div>
    <div className="mt-4 text-2xl font-bold">{value}</div>
  </div>
);

const ListingCard = ({ title, subtitle, status, timeLeft }) => (
  <div className="bg-white rounded-2xl p-5 shadow-md border border-green-200 w-full max-w-md">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-xs uppercase bg-gray-100 inline-block px-3 py-1 rounded-full text-sm font-medium">{status}</div>
        <h3 className="mt-3 text-lg font-semibold">{title}</h3>
        <div className="text-sm text-mid-gray">{subtitle}</div>
      </div>
      <div className="text-sm text-green-800 bg-green-100 px-3 py-1 rounded-full">{timeLeft}</div>
    </div>

    <div className="mt-4 bg-green-50 text-green-800 px-3 py-2 rounded-lg">Claimed by Chinedu O. · 2 min ago</div>

    <button className="mt-4 w-full border border-red-200 text-red-600 rounded-lg py-2">Cancel sharing</button>
  </div>
);

export default function PosterDashboard() {
  return (
    <div className="min-h-screen bg-emerald-50 p-8">
      <div className="max-w-7xl mx-auto">
        <a href="/" className="text-sm text-mid-gray inline-flex items-center gap-2">← Back to home</a>

        <div className="mt-6 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">POSTER DASHBOARD PREVIEW</div>
            <h1 className="mt-4 text-4xl font-extrabold">Poster dashboard</h1>
            <p className="text-lg text-mid-gray mt-2">Post surplus food, track your listings, and see how many people you've helped.</p>
          </div>

          <div>
            <button className="bg-green-800 text-white px-5 py-3 rounded-full inline-flex items-center gap-2"><PlusCircle size={18} /> Post new food</button>
          </div>
        </div>

        <div className="mt-8 flex gap-6">
          {statCard(<Package size={18} className="text-green-700" />, 'Active listings', 2)}
          {statCard(<Check size={18} className="text-green-700" />, 'Total claims', 12)}
          {statCard(<Leaf size={18} className="text-green-700" />, 'Meals shared', 26)}
        </div>

        <h2 className="mt-10 text-xl font-semibold">Your listings</h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ListingCard title="Suya Platter (leftover from event)" subtitle="Serves 8 · Lagos" status="Hot meal" timeLeft="1h 30m left" />
          <ListingCard title="Boxed Sandwiches" subtitle="15 boxes · Lagos" status="Snacks" timeLeft="4h left" />
        </div>

        {/* <p className="mt-8 text-center text-sm text-mid-gray">Preview only — toggle the role pill above to show the team both views. All actions are frontend mocks.</p> */}
      </div>
    </div>
  );
}
