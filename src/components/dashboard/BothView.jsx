'use client'

import { useState } from 'react'
import HirerView from './HirerView'
import ProviderView from './ProviderView'

const T = {
  navy:   '#0F172A',
  coral:  '#E8523A',
  border: '#E2E8F0',
  bg:     '#F8FAFC',
  textLight: '#94A3B8',
}

export default function BothView({ profile, recentJobs, myJobs, pendingReviews = [] }) {
  const [activeTab, setActiveTab] = useState('hirer')

  return (
    <div>
      {/* Slim tab switcher */}
      <div
        className="inline-flex items-center mb-5 border"
        style={{ borderColor: T.border, borderRadius: 4, background: '#fff', padding: 3 }}
      >
        {[
          { key: 'hirer',    label: 'Hirer View'    },
          { key: 'provider', label: 'Provider View' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-5 py-1.5 text-sm font-semibold transition-all"
            style={activeTab === tab.key
              ? { background: T.navy, color: '#fff', borderRadius: 3 }
              : { color: T.textLight }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'hirer'
        ? <HirerView profile={profile} myJobs={myJobs} pendingReviews={pendingReviews} />
        : <ProviderView profile={profile} recentJobs={recentJobs} pendingReviews={pendingReviews} />
      }
    </div>
  )
}