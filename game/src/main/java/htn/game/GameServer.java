package htn.game;

import java.net.SocketAddress;
import java.util.HashMap;

import org.json.JSONObject;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;

public class GameServer {
	private SocketIOServer server;
	private Class<String> eventClass;
	private HashMap<SocketAddress,Room> clientRoomMap;
	private SocketIOClient waitingClient;
	
	public GameServer() {
		clientRoomMap = new HashMap<SocketAddress,Room>();
		waitingClient = null;
		//BroadcastOperations bo = server.getRoomOperations("asdf");
	}
	
	public static void main(String[] args) throws Exception {
		GameServer connector = new GameServer();
		connector.run();
	}
	
	public void run() throws Exception {
		Configuration config = new Configuration();
	    config.setHostname("localhost");
	    config.setPort(80);

	    server = new SocketIOServer(config);
		
		server.addConnectListener(new ConnectListener() {

			// @Override
			public void onConnect(SocketIOClient client) {
				System.out.println("connected");
				addPlayer(client);
			}

		});
		
		server.addDisconnectListener(new DisconnectListener() {
			
			public void onDisconnect(SocketIOClient client) {
				System.out.println("disconnected");
				removePlayer(client);
			}
		
		});
		
		server.addEventListener("Player Action", eventClass, new DataListener<String>() {
			
			public void onData(SocketIOClient client, String data, AckRequest ackRequest) {
				System.out.println(data);
				processAction(client, data);
			}
		});
		
		server.start();
	}
	
	private synchronized void processAction(SocketIOClient client, String data) {
		Room room = clientRoomMap.get(client.getRemoteAddress());
		room.messageAll("Action", data);
	}
	
	private synchronized void addPlayer(SocketIOClient client) {
		if(waitingClient == null)
			waitingClient = client;
		else {
			Room room = new Room();
			room.addClient(waitingClient);
			room.addClient(client);
			clientRoomMap.put(waitingClient.getRemoteAddress(), room);
			clientRoomMap.put(client.getRemoteAddress(), room);
			room.messageAll("Game created", createGame().toString());
			waitingClient = null;
		}
	}
	
	private synchronized void removePlayer(SocketIOClient client) {
		Room room = clientRoomMap.get(client.getRemoteAddress());
		room.messageAll("Disconnect", "Player has disconnected.");
		for(SocketIOClient sic : room.clients) {
			clientRoomMap.remove(sic);
		}
	}
	
	private JSONObject createGame() {
		return null;
	}
}
