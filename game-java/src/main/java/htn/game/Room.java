package htn.game;

import java.util.ArrayList;

import com.corundumstudio.socketio.SocketIOClient;

/**
 * Hello world!
 *
 */
public class Room 
{
    public ArrayList<SocketIOClient> clients;
    
    public Room() {
    	clients = new ArrayList<SocketIOClient>();
    }
    
    public Room(ArrayList<SocketIOClient> clients) {
    	this.clients = clients;
    }
    
    public void addClient(SocketIOClient client) {
    	clients.add(client);
    }
    
    public void removeClient(SocketIOClient client) {
    	clients.remove(client);
    }
    
    public void messageAll(String event, String data) {
    	for (SocketIOClient client : clients) {
    		client.sendEvent(event, data);
    	}
    }
}
