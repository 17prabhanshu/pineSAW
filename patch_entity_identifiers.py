import re

with open('src/app/entities/[id]/page.tsx', 'r') as f:
    content = f.read()

identifiers_tab = """
        {activeTab === "IDENTIFIERS" && (
          <div className="mt-6 px-2 max-w-5xl">
            <h3 className="text-lg font-display font-semibold text-white mb-6">Known Digital & Physical Identifiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Communication Handles */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <IdentificationCard size={16} weight="fill" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Communication Handles</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                    <div>
                      <div className="text-xs font-mono text-zinc-400 mb-0.5">Telegram</div>
                      <div className="text-sm font-bold text-zinc-200">@shadow_broker_t</div>
                    </div>
                    <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-400 font-mono rounded">VERIFIED</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                    <div>
                      <div className="text-xs font-mono text-zinc-400 mb-0.5">ProtonMail</div>
                      <div className="text-sm font-bold text-zinc-200">shadow99@proton.me</div>
                    </div>
                    <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-400 font-mono rounded">VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Financial Assets */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <HandCoins size={16} weight="fill" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Cryptographic Wallets</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                    <div>
                      <div className="text-xs font-mono text-zinc-400 mb-0.5">Bitcoin (BTC)</div>
                      <div className="text-sm font-mono text-zinc-200 truncate max-w-[200px]">bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq</div>
                    </div>
                    <span className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-400 font-mono rounded">HIGH RISK</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                    <div>
                      <div className="text-xs font-mono text-zinc-400 mb-0.5">Ethereum (ETH)</div>
                      <div className="text-sm font-mono text-zinc-200 truncate max-w-[200px]">0x742d35Cc6634C0532925a3b844Bc454e4438f44e</div>
                    </div>
                    <span className="text-[10px] px-2 py-1 bg-zinc-500/10 text-zinc-400 font-mono rounded">UNKNOWN</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
"""

content = content.replace('{activeTab === "RELATIONSHIPS" && (', identifiers_tab + '\n        {activeTab === "RELATIONSHIPS" && (')

with open('src/app/entities/[id]/page.tsx', 'w') as f:
    f.write(content)
