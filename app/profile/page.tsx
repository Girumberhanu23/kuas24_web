"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "settings">(
    "overview"
  );

  const stats = [
    { label: "Articles Read", value: "142", icon: "📰" },
    { label: "Favorites", value: "23", icon: "❤️" },
    { label: "Leagues Followed", value: "5", icon: "⚽" },
    { label: "Days Active", value: "87", icon: "🔥" },
  ];

  const followedLeagues = [
    { name: "Premier League", color: "from-primary to-secondary" },
    { name: "La Liga", color: "from-primary to-secondary" },
    { name: "Serie A", color: "from-primary to-secondary" },
    { name: "Bundesliga", color: "from-primary to-secondary" },
    { name: "Champions League", color: "from-primary to-secondary" },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Profile Header */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
          <span className="text-4xl font-bold text-white">JD</span>
        </div>
        <h1 className="mb-1 text-xl font-bold text-text">John Doe</h1>
        <p className="mb-4 text-sm text-text-secondary">
          Sports enthusiast • Member since 2025
        </p>
        <div className="flex justify-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Premium Member
          </span>
          <span className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-text-secondary">
            Broadcaster
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 rounded-xl bg-card p-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === "overview"
              ? "bg-primary text-white"
              : "text-text-secondary hover:text-text"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === "settings"
              ? "bg-primary text-white"
              : "text-text-secondary hover:text-text"
          }`}
        >
          Settings
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-4 text-center"
              >
                <span className="mb-1 block text-2xl">{stat.icon}</span>
                <p className="text-2xl font-bold text-text">{stat.value}</p>
                <p className="text-xs text-text-secondary">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Followed Leagues */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-secondary">
              Leagues You Follow
            </h3>
            <div className="grid gap-2">
              {followedLeagues.map((league) => (
                <div
                  key={league.name}
                  className="flex items-center justify-between rounded-lg bg-bg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg bg-gradient-to-br ${league.color}`}
                    />
                    <span className="text-sm font-medium text-text">
                      {league.name}
                    </span>
                  </div>
                  <button className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20">
                    Following
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Settings */}
          <div className="grid gap-4">
            {/* Notifications */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-secondary">
                Notifications
              </h3>
              <div className="grid gap-3">
                {[
                  {
                    label: "Breaking News",
                    desc: "Get notified for breaking sports news",
                  },
                  {
                    label: "Live Match Updates",
                    desc: "Score updates for followed teams",
                  },
                  {
                    label: "Transfer Rumors",
                    desc: "Latest transfer news and rumors",
                  },
                  {
                    label: "Weekly Digest",
                    desc: "Weekly roundup of top stories",
                  },
                ].map((setting, i) => (
                  <div
                    key={setting.label}
                    className="flex items-center justify-between rounded-lg bg-bg p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-text">
                        {setting.label}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {setting.desc}
                      </p>
                    </div>
                    <div
                      className={`h-6 w-11 cursor-pointer rounded-full transition-colors ${
                        i < 2 ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
                          i < 2 ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-secondary">
                Account
              </h3>
              <div className="grid gap-2">
                {[
                  "Edit Profile",
                  "Change Password",
                  "Privacy Settings",
                  "Language",
                ].map((item) => (
                  <button
                    key={item}
                    className="flex items-center justify-between rounded-lg bg-bg p-3 text-left transition-colors hover:bg-card-hover"
                  >
                    <span className="text-sm font-medium text-text">
                      {item}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-text-secondary"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl border border-secondary/30 bg-card p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-secondary">
                Danger Zone
              </h3>
              <button className="w-full rounded-lg bg-secondary/10 py-3 text-sm font-medium text-secondary transition-colors hover:bg-secondary/20">
                Delete Account
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
