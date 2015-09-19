package htn.game;

import java.util.HashMap;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.BroadcastOperations;
import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;

public class GameServer {
	private SocketIOServer server;
	private Class<String> eventClass;
	private HashMap<SocketIOClient,Room> clientRoomMap;
	private SocketIOClient waitingClient;
	
	public GameServer() {
		clientRoomMap = new HashMap<SocketIOClient,Room>();
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
	    config.setPort(8080);

	    server = new SocketIOServer(config);
		
		server.addConnectListener(new ConnectListener() {

			// @Override
			public void onConnect(SocketIOClient client) {
				addPlayer(client);
			}

		});
		
		server.addDisconnectListener(new DisconnectListener() {
			
			public void onDisconnect(SocketIOClient client) {
				removePlayer(client);
			}
		
		});
		
		server.addEventListener("Player Action", eventClass, new DataListener<String>() {
			
			public void onData(SocketIOClient client, String data, AckRequest ackRequest) {
				processAction(client, data);
			}
		});
		
		server.start();
	}
	
	private void processAction(SocketIOClient client, String data) {
		Room room = clientRoomMap.get(client);
		room.messageAll("Action", data);
	}
	
	private void addPlayer(SocketIOClient client) {
		if(waitingClient == null)
			waitingClient = client;
		else {
			Room room = new Room();
			room.addClient(waitingClient);
			room.addClient(client);
			clientRoomMap.put(waitingClient, room);
			clientRoomMap.put(client, room);
			room.messageAll("Game created", "insert game here");
			waitingClient = null;
		}
	}
	
	private void removePlayer(SocketIOClient client) {
		Room room = clientRoomMap.get(client);
		room.messageAll("Disconnect", "Player has disconnected.");
		for(SocketIOClient sic : room.clients) {
			clientRoomMap.remove(sic);
		}
	}
}
