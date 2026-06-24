import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, Leaf, Package, Check } from 'lucide-react';

const statCard = (icon, label, value) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm flex-1 min-w-0 w-full">
    <div className="flex items-center gap-3 text-sm text-mid-gray">
      {icon}
      <span className="uppercase text-xs tracking-wide">{label}</span>
    </div>
    <div className="mt-4 text-2xl font-bold">{value}</div>
  </div>
);

const ListingCard = ({ title, subtitle, status, timeLeft }) => (
  <div className="bg-white rounded-2xl p-5 shadow-md border border-green-200 w-full">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <div className="text-xs uppercase bg-gray-100 inline-block px-3 py-1 rounded-full text-sm font-medium">{status}</div>
        <h3 className="mt-3 text-lg font-semibold">{title}</h3>
        <div className="text-sm text-mid-gray">{subtitle}</div>
      </div>
      <div className="mt-2 md:mt-0 text-sm text-green-800 bg-green-100 px-3 py-1 rounded-full self-start">{timeLeft}</div>
    </div>

    <div className="mt-4 bg-green-50 text-green-800 px-3 py-2 rounded-lg">Claimed by Chinedu O. · 2 min ago</div>

    <button className="mt-4 w-full border border-red-200 text-red-600 rounded-lg py-2">Cancel sharing</button>
  </div>
);

export default function PosterDashboard() {
  return (
    <div className="min-h-screen bg-emerald-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <a href="/" className="text-sm text-mid-gray inline-flex items-center gap-2">← Back to home</a>

        <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em]">POSTER DASHBOARD PREVIEW</div>
            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold">Poster dashboard</h1>
            <p className="text-base md:text-lg text-mid-gray mt-2">Post surplus food, track your listings, and see how many people you've helped.</p>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto">
            <Link to="/post" className="inline-flex w-full justify-center bg-green-800 text-white px-5 py-3 rounded-full items-center gap-2 md:w-auto"> <PlusCircle size={18} /> Post new food</Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {statCard(<Package size={18} className="text-green-700" />, 'Active listings', 2)}
          {statCard(<Check size={18} className="text-green-700" />, 'Total claims', 12)}
          {statCard(<Leaf size={18} className="text-green-700" />, 'Meals shared', 26)}
        </div>

        <h2 className="mt-10 text-xl font-semibold">Your listings</h2>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ListingCard title="Suya Platter (leftover from event)" subtitle="Serves 8 · Lagos" status="Hot meal" timeLeft="1h 30m left" />
          <ListingCard title="Boxed Sandwiches" subtitle="15 boxes · Lagos" status="Snacks" timeLeft="4h left" />
        </div>

        {/* <p className="mt-8 text-center text-sm text-mid-gray">Preview only — toggle the role pill above to show the team both views. All actions are frontend mocks.</p> */}
      </div>
    </div>
  );
}
