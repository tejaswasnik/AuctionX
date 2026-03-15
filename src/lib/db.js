import { supabase } from './supabase'

export const db = {
  // AUTH
  async loginTeam(teamName, password) {
    return supabase
      .from('teams')
      .select('*')
      .ilike('team_name', teamName)
      .eq('password', password)
      .single()
  },

  // TEAMS
  async getTeams() {
    return supabase
      .from('teams')
      .select('*')
      .order('team_name')
  },

  async getTeam(id) {
    return supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()
  },

  // ITEMS
  async getItems() {
    return supabase
      .from('items')
      .select('*')
      .order('category')
  },

  // PURCHASES
  async getPurchases(teamId = null) {
    let query = supabase
      .from('purchases')
      .select('*, items(*)')
      .order('timestamp', { ascending: false })

    if (teamId) query = query.eq('team_id', teamId)

    return query
  },

  async assignItem(teamId, itemId, cost) {
    const { error: insertError } = await supabase
      .from('purchases')
      .insert({ team_id: teamId, item_id: itemId, cost })

    if (insertError) return { error: insertError }

    const { error } = await supabase.rpc('deduct_balance', {
      p_team_id: teamId,
      p_amount: cost,
    })

    return { error }
  },

  // RESULTS
  async getResults() {
    return supabase
      .from('results')
      .select('*, teams(team_name, color)')
      .order('rank', { ascending: true })
  },

  async upsertResult(teamId, rank, score, projectName, projectDesc) {
    return supabase
      .from('results')
      .upsert(
        { team_id: teamId, rank, score, project_name: projectName, project_desc: projectDesc },
        { onConflict: 'team_id' }
      )
  },

  // TEAM MANAGEMENT
  async addTeam(teamName, password, startingCurrency, color) {
    return supabase
      .from('teams')
      .insert({ team_name: teamName, password, currency_balance: startingCurrency, color })
      .select()
      .single()
  },

  async deleteTeam(id) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)
    return { error }
  },

  // UNDO PURCHASE
  async undoPurchase(purchaseId, teamId, cost) {
    const { error: deleteError } = await supabase
      .from('purchases')
      .delete()
      .eq('id', purchaseId)

    if (deleteError) return { error: deleteError }

    const { error } = await supabase.rpc('refund_balance', {
      p_team_id: teamId,
      p_amount: cost,
    })

    return { error }
  },

  // LEADERBOARD CONTROL
  async clearLeaderboard() {
    const { error } = await supabase
      .from('results')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    return { error }
  },

  // SYSTEM RESET
  async resetAuction(deleteTeams = false) {
    await supabase.from('purchases').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('results').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.rpc('reset_all_balances')
    if (deleteTeams) {
      await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    }
  },
}
