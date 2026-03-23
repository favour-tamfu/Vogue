'use client'

import { useState } from 'react'
import HirerView from './HirerView'
import ProviderView from './ProviderView'

const T = {
  navy:      '#0F172A',
  coral:     '#E8523A',
  border:    '#E2E8F0',
  textLight: '#94A3B8',
}

export default function BothView({
  profile, recentJobs, myJobs, pendingReviews,
  recentBids, feedItems, unreadMessages,
  hirerStats, providerStats, topProviders
}) {
  const [activeTab, setActiveTab] = useState('hirer')

  return (
    <div>
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

      {activeTab === 'hirer' ? (
        <HirerView
          profile={profile}
          myJobs={myJobs}
          pendingReviews={pendingReviews}
          recentBids={recentBids}
          feedItems={feedItems}
          unreadMessages={unreadMessages}
          hirerStats={hirerStats}
          topProviders={topProviders}
        />
      ) : (
        <ProviderView
          profile={profile}
          recentJobs={recentJobs}
          pendingReviews={pendingReviews}
          providerStats={providerStats}
          unreadMessages={unreadMessages}
          topProviders={topProviders}
        />
      )}
    </div>
  )
}