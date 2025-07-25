const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

exports.sendMessage = async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;

  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender_id, receiver_id, content }]);

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }

  res.json(data[0]);
};

exports.getMessageThread = async (req, res) => {
  const { senderId, receiverId } = req.params;

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Failed to fetch thread" });
  }

  res.json(data);
};

// GET /api/messages/thread/:user1/:user2
exports.getConversation = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
  `and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`
      )
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching thread:", err.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

exports.getChatPartners = async (req, res) => {
  const { userId } = req.params;

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("sender_id, receiver_id")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) throw error;

    const chatUserIds = new Set();

    data.forEach(msg => {
      if (msg.sender_id !== parseInt(userId)) chatUserIds.add(msg.sender_id);
      if (msg.receiver_id !== parseInt(userId)) chatUserIds.add(msg.receiver_id);
    });

    const ids = [...chatUserIds];

    const { data: users, error: userError } = await supabase
      .from("patients")
      .select("id, first_name, last_name, profile_picture")
      .in("id", ids);

    if (userError) throw userError;

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      avatar: user.profile_picture || null,
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error("❌ Error fetching chat partners:", err.message);
    res.status(500).json({ error: "Failed to fetch chat partners" });
  }
};


