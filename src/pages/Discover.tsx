// ... continuazione di renderVehicleCard
                                    /A'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-zinc-500">
                                  <Gauge size={12} className="text-white" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {vehicle.suspension_type}
                                  </span>
                                </div>
                              </div>
                              
                              {vehicle.license_plate && canSeePlate && (
                                <div className="flex items-center gap-2 bg-white text-black px-2.5 py-1 rounded-lg w-fit shadow-lg">
                                  <CreditCard size={12} />
                                  <span className="text-[10px] font-black uppercase italic tracking-widest">{vehicle.license_plate}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className={cn(
                            "flex items-center justify-between",
                            viewMode === 'list' && "md:w-72 md:pl-10"
                          )}>
                            <button 
                              onClick={() => navigate(`/profile/${vehicle.user_id}`)}
                              className="flex items-center gap-4 hover:opacity-70 transition-opacity group/user text-left min-w-0"
                            >
                              <div className={cn(
                                "w-10 h-10 bg-black rounded-full overflow-hidden border-2 transition-all duration-500",
                                isUserOnline(vehicle.user_id) ? "border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "border-white/10"
                              )}>
                                {vehicle.profiles?.avatar_url ? (
                                  <img src={vehicle.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={18} /></div>
                                )}
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[10px] font-black uppercase italic text-zinc-300 group-hover/user:text-white transition-colors truncate">
                                    {vehicle.profiles?.username}
                                  </span>
                                  {vehicle.profiles?.is_admin && <ShieldCheck size={10} className="text-white shrink-0" />}
                                </div>
                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest truncate">
                                  {roleLabel}
                                </span>
                              </div>
                            </button>

                            <button 
                              onClick={() => handleOpenProject(vehicle)}
                              className="md:hidden p-2 text-zinc-500 hover:text-white transition-colors bg-white/5 rounded-full"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
    );
  };

  return (
    <div className="min-h-screen text-white flex flex-col bg-transparent">
      <Navbar />
      
      <main className="flex-1 pt-[calc(4rem+env(safe-area-inset-top)+2rem)] pb-32 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <header className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">
                {debouncedSearch ? "Risultati Ricerca" : "District Showroom"}
              </h2>
              <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                {debouncedSearch ? `"${debouncedSearch}"` : "Esplora"}
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  type="text"
                  placeholder="CERCA AUTO O MEMBRI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full h-14 pl-14 text-[11px] font-black uppercase tracking-widest focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-zinc-700"
                />
                {isLoading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-zinc-600" size={16} />}
              </div>

              <div className="flex bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full p-1 h-14">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "flex-1 sm:w-14 flex items-center justify-center gap-2 px-4 rounded-full transition-all duration-500", 
                    viewMode === 'grid' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <LayoutGrid size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest sm:hidden">Griglia</span>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "flex-1 sm:w-14 flex items-center justify-center gap-2 px-4 rounded-full transition-all duration-500", 
                    viewMode === 'list' ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"
                  )}
                >
                  <StretchHorizontal size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest sm:hidden">Lista</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <DailyWinner />

        {!debouncedSearch && newMembers && newMembers.length > 0 && (
          <section className="mb-14">
            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 italic mb-6">
              <Sparkles size={12} /> Nuovi nel Distretto
            </h3>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
              {newMembers.map((member, i) => (
                <button 
                  key={`new-member-${member.id}-${i}`}
                  onClick={() => navigate(`/profile/${member.id}`)}
                  className="flex flex-col items-center gap-3 shrink-0 group"
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full p-[2px] border-2 transition-all duration-500",
                    isUserOnline(member.id) ? "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "border-white/10"
                  )}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-black">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-800"><User size={24} /></div>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase italic truncate w-20 text-center text-zinc-500 group-hover:text-white transition-colors">
                    {member.username}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 1. TOP 5 LOW REPUTATION */}
        {!debouncedSearch && topReputation && topReputation.length > 0 && (
          <section className="mb-14">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 italic">
                <Star size={12} className="text-blue-500" /> Top 5 Low Reputation
              </h3>
              <Link to="/leaderboards?tab=reputation" className="text-[6px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                Classifica Completa <ArrowRight size={10} />
              </Link>
            </div>
            {viewMode === 'grid' ? (
              <div className="embla overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRepRef}>
                <div className="embla__container flex gap-4">
                  {topReputation.slice(0, 5).map((v, i) => (
                    <div key={`rep-grid-${v.id}-${i}`} onClick={() => handleOpenProject(v)} className="embla__slide flex-[0_0_70%] sm:flex-[0_0_40%] md:flex-[0_0_25%] min-w-0 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden group cursor-pointer">
                      <div className="aspect-video relative overflow-hidden">
                        <img src={v.images?.[0] || v.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt="" />
                        <div className="absolute top-3 left-3">
                          <RankBadge rank={i + 1} type="score" />
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-black uppercase italic truncate">{v.brand} {v.model}</p>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">@{v.profiles?.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {topReputation.slice(0, 5).map((v, i) => renderVehicleCard(v, i, { rank: i + 1, type: 'score' }))}
              </div>
            )}
          </section>
        )}

        {/* 2. TOP 5 LOW SCORE */}
        {!debouncedSearch && topScored && topScored.length > 0 && (
          <section className="mb-14">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 italic">
                <Trophy size={12} className="text-yellow-500" /> Top 5 Low Score
              </h3>
              <Link to="/leaderboards" className="text-[6px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                Classifica Completa <ArrowRight size={10} />
              </Link>
            </div>
            {viewMode === 'grid' ? (
              <div className="embla overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaScoreRef}>
                <div className="embla__container flex gap-4">
                  {topScored.slice(0, 5).map((v, i) => (
                    <div key={`score-grid-${v.id}-${i}`} onClick={() => handleOpenProject(v)} className="embla__slide flex-[0_0_70%] sm:flex-[0_0_40%] md:flex-[0_0_25%] min-w-0 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden group cursor-pointer">
                      <div className="aspect-video relative overflow-hidden">
                        <img src={v.images?.[0] || v.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt="" />
                        <div className="absolute top-3 left-3">
                          <RankBadge rank={i + 1} type="score" />
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-black uppercase italic truncate">{v.brand} {v.model}</p>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">@{v.profiles?.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {topScored.slice(0, 5).map((v, i) => renderVehicleCard(v, i, { rank: i + 1, type: 'score' }))}
              </div>
            )}
          </section>
        )}

        {/* 3. TOP 5 LIKE SCORE */}
        {!debouncedSearch && mostLiked && mostLiked.length > 0 && (
          <section className="mb-14">
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 italic">
                <Heart size={12} className="text-red-500" /> Top 5 Like Score
              </h3>
              <Link to="/leaderboards" className="text-[6px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                Classifica Completa <ArrowRight size={10} />
              </Link>
            </div>
            {viewMode === 'grid' ? (
              <div className="embla overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaLikeRef}>
                <div className="embla__container flex gap-4">
                  {mostLiked.slice(0, 5).map((v, i) => (
                    <div key={`liked-grid-${v.id}-${i}`} onClick={() => handleOpenProject(v)} className="embla__slide flex-[0_0_70%] sm:flex-[0_0_40%] md:flex-[0_0_25%] min-w-0 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden group cursor-pointer">
                      <div className="aspect-video relative overflow-hidden">
                        <img src={v.images?.[0] || v.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt="" />
                        <div className="absolute top-3 left-3">
                          <RankBadge rank={i + 1} type="likes" />
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-black uppercase italic truncate">{v.brand} {v.model}</p>
                        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">@{v.profiles?.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {mostLiked.slice(0, 5).map((v, i) => renderVehicleCard(v, i, { rank: i + 1, type: 'likes' }))}
              </div>
            )}
          </section>
        )}

        <AnimatePresence>
          {debouncedSearch && users && users.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 space-y-6"
            >
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 italic border-b border-white/5 pb-4">
                <Users size={12} /> Membri Trovati
              </h3>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                {users.map((user, i) => (
                  <button 
                    key={`search-user-${user.id}-${i}`}
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="flex flex-col items-center gap-3 shrink-0 group"
                  >
                    <div className={cn(
                      "w-24 h-24 rounded-full p-[3px] border-2 transition-all duration-500",
                      isUserOnline(user.id) ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "border-white/10"
                    )}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-black">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={32} /></div>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-black uppercase italic truncate w-28 group-hover:text-white transition-colors">{user.username}</p>
                      {user.is_admin && <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Staff</p>}
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 flex items-center gap-2 italic">
              <Car size={12} /> {debouncedSearch ? "Progetti Corrispondenti" : "Ultimi Veicoli Caricati"}
            </h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-zinc-500" size={40} />
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 italic">Sincronizzazione Garage...</p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
            )}>
              <AnimatePresence mode="popLayout">
                {vehicles?.map((vehicle, i) => renderVehicleCard(vehicle, i))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {selectedVehicle && (
          <VehicleDetailModal 
            isOpen={!!selectedVehicle} 
            onClose={() => setSelectedVehicle(null)} 
            vehicle={selectedVehicle}
            isOwnProfile={currentUserId === selectedVehicle.user_id}
            onLike={(id) => toggleLike.mutate(id)}
            currentUserId={currentUserId}
          />
        )}
        {stanceVehicle && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStanceVehicle(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-black border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl">
              <StanceAnalyzer 
                imageUrl={stanceVehicle.images?.[0] || stanceVehicle.image_url || ''} 
                vehicleId={stanceVehicle.id} 
                onClose={() => setStanceVehicle(null)} 
                autoStart={true}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discover;